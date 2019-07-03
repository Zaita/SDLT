#!/usr/bin/python

"""
Russell Michell 2018 <russellmichell@catalyst.net.nz>

What is this?
 
* Called from ./.tools/provision.sh
* Ensures the correct PHP version, gets the appropriate extensions 
* Will simply print a CSV list of extensions to stdout for consumption by ./.tools/init.sh
"""

import json, sys

try:
    phpver = sys.argv[1:][1]
except:
    sys.exit(1)

if phpver == None:
    sys.exit(1)

# array_merge() for Python 2.x
def merge(x, y):
    if type(x) is dict and type(y) is dict:
        z = x.copy()
        z.update(y)
    elif type(x) is list and type(y) is list:
        z = list(set(x + y))
    else:
        return None
    return z

with open('./.phpexts.json', 'r') as jsonFile:
    d = json.loads(jsonFile.read())
    merged = merge(d['common'], d[phpver])

    # Print as CSV
    i = 0;
    for ext in merged:
        i+=1
        print ext
