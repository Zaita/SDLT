#!/usr/bin/python

"""
Used to generate a dashboard.json file for use in the SilverStripe Team's, Raspberry Pi dashboard
Russell Michell 2018 <russellmichell@catalyst.net.nz>

Notes:
- Requires the `jq` program for piping JSON files into, for CLI pretty printing and JSON parsing.
- Assumes that the logo to be used is always named "logo.png" for each project.
- Redmine API key is a personal team-member's key passed into `scripts/init.sh`
- Gitlab API key - as above - is also a personal team-member's key
"""
import argparse, json, os, subprocess, hashlib

# Deal with input args

parser = argparse.ArgumentParser()

parser.add_argument("-s", help="Short name (The project's short name)")
parser.add_argument("-f", help="Full name (The project's full name)")
parser.add_argument("-g", help="Gitlab URL (The project's full gitlab URL)")
parser.add_argument("-i", help="Gitlab Project ID")
parser.add_argument("-t", help="Your personal Gitlab and RedMine API tokens: <gitlab>:<redmine>")

args = parser.parse_args()

# Get the individual tokens out of the single -t arg
api_tok_gl = args.t.split(':')[0]
api_tok_rm = args.t.split(':')[1]

# Ensure the `jq` program is installed
def which(program):
    def is_exe(fpath):
        return os.path.isfile(fpath) and os.access(fpath, os.X_OK)

    fpath, fname = os.path.split(program)
    if fpath and is_exe(program):
        return program
    else:
        for path in os.environ["PATH"].split(os.pathsep):
            exe_file = os.path.join(path, program)
            if is_exe(exe_file):
                return exe_file

    return None

if which('jq') == None:
    print "[Error] Missing dependency: Please install the 'jq' program: https://stedolan.github.io/jq/"

# Determine the appropriate gitlab & redmine API tokens to use
def getToken(system):
    if system == 'gitlab':
        return api_tok_gl
    elif system == 'redmine':
        return api_tok_rm
    else:
        return None

# Fetch gitlab project created date
def getVcsCreatedDate():
    header = 'PRIVATE-TOKEN:%s' % (getToken('gitlab'))
    endpoint = 'https://%s/api/v4/projects/%s/repository/commits' % (args.g.split('/')[2], args.i)
    cmd = 'curl -sH "%s" "%s" | jq -r .[-1].authored_date' % (header, endpoint)

    # This returns JSON encased in '"' which need to be stripped first to prevent escaped quotes in the o/p
    return subprocess.check_output(cmd, shell=True).strip()

# Fetch Redmine project data. Return as JSON for the given project_name
# TODO Deal to JSON processing using the imported "json" module
def getRedmineData(endpoint, project_name):
    header = 'X-Redmine-API-Key:%s' % (getToken('redmine'))
    url = 'https://redmine.catalyst.net.nz/%s.json?include=trackers' % (endpoint)
    cmd = "curl -sH '%s' '%s' | jq -r '.[][]? | select ( .name == \"%s\" )'" % (header, url, project_name.strip())

    return subprocess.check_output(cmd, shell=True)

# Takes the o/p of getRedmineData() and uses+returns a dict containing project-id and Story tracker-id
def getProjectData(project_name):
    data = getRedmineData('projects', project_name.strip())

    if not len(data):
        project_id = 0
        tracker_id = 0
    else:
        s = hashlib.sha256()
        s.update(project_name)
        tmpFileName = '/tmp/%s.json' % s.hexdigest()

        with open(tmpFileName, 'wb') as tmpFile:
            tmpFile.write(data)
    
        # Resort to CLI logic, so we can invoke the `jq` program
        project_id = subprocess.check_output("cat %s | jq -r '.id'" % tmpFileName, shell=True)
        tracker_id = subprocess.check_output("cat %s | jq -r '.trackers[] | select ( .name == \"Story\" ).id'" % tmpFileName, shell=True)

    return { 'project_id': str(project_id).strip(), 'tracker_id': str(tracker_id).strip() }

"""
Build a dict of script params for converting to JSON
TODO Use a URL-parsing lib instead of split()
"""
jsonData = {
    'project': {
        'created': getVcsCreatedDate(),
        'long_name': args.f,
        'short_name': args.s,
        'logo': 'https://%s/uploads/-/system/project/avatar/%s/logo.png' % (args.g.split('/')[2], args.i)
    },
    'vcs': {
        'url': args.g,
        'name_space': args.g.split('/')[3],
        'project_id': args.i
    },
    'pane_master': {
        'title': '',
        'branch_name': "master",
        'badge': 'badges/master/build.svg',
        'commits': '[]',
        'jobs': '[]'
    },
    'pane_develop': {
        'title': '',
        'branch_name': "develop",
        'badge': 'badges/develop/build.svg',
        'commits': '[]',
        'jobs': '[]'
    },
    'scriptFile': '',
    'redmineFile': '',
    'redmineProjectDetails': {
        'project_id': getProjectData(args.f)['project_id'],
        'tracker_id': getProjectData(args.f)['tracker_id'],
        'limit': 20,
        'redmineData': '[]'
    }
}

# Write the dashboard.json
with open('dashboard.json', 'wb') as outfile:
    json.dump(jsonData, outfile)

