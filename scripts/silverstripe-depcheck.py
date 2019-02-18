#!/usr/bin/python
#
# Russell Michell 2018 <russellmichell@catalyst.net.nz>
#
# What is this?
#
# Parses the SilverStripe Security Releases RSS feed for vulnerabilities in the current project's
# composer.lock file.
# 
# Requirements:
#
# Feedparser:    pip install feedparser
# BeautifulSoup: apt-get install python-bs4

from bs4 import BeautifulSoup
import json, sys, feedparser, re

feed_url = 'https://www.silverstripe.org/download/security-releases/rss'

# We use this pseudo constant when no package is given in the RSS advisories
# and assume (from advice) that it is correct to infer that silverstripe/framework was meant.
DEFAULT_PACKAGE = 'silverstripe/framework'

has_advisories = False

# Clean up version constraints
def clean_version(input):
    return re.sub('[^[\d.]', '', input)

# Cleanup package-names
def clean_package(input):
    return input.strip(' :')

with open('./composer.lock', 'r') as composerLockFile:
    json = json.load(composerLockFile)
    feed = feedparser.parse(feed_url)

    if feed.channel == None:
        print 'No feed data found.'
        sys.exit(1)

    for package in json['packages']:
        c_package = package['name']
        c_version = clean_version(package['version'])

        for item in feed['items']:
            soup = BeautifulSoup(item['description'], 'html.parser')
            # All entity-encoded <dd> HTML elements found within an RSS <description> element
            allDDs = soup.find_all('dd')
            # TODO Can also use BS4 to access via class="foo" rather than as a dict/numeric-index
            severity = allDDs[0].string
            identifier = allDDs[1].string
            versionsAffected = allDDs[2].string
            versionsFixed = allDDs[3].string
            advisory_link = item.link

            # Advisories sometimes exclude the package name. Assume this means "silverstripe/framework"
            # Advisories are formatted slightly differently (with/without colon-separated spaces between <package><version>)
            package = re.sub("[\s:]?((>=?)?\s?)?(\d\.?)+(-rc\d)?,?", '', versionsFixed)
            version = re.sub("([^\/]\w+\/[\w-]+(?=[\s:]))+", '', versionsFixed)
            f_package = clean_package(package)
            f_version = version

            # Basic test to see if a package has been stipulated. If not, we assume: DEFAULT_PACKAGE
            if f_package is None or '/' not in f_package:
                f_package = DEFAULT_PACKAGE

            if c_package != f_package:
                continue
            
            for fixed_version in f_version.split(','):
                is_vulnerable = c_version < fixed_version

                if is_vulnerable:
                    has_advisories = True
                    print '[ALERT] %s version %s has a security advisory: %s' % (c_package, c_version, advisory_link)

if has_advisories is True:
    sys.exit(1)
