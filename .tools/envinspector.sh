#!/bin/bash
# Check a local .env file and ensure all constants are quoted
# 
# Russell Michell 2019 <russellmichell@catalyst.net.nz>

GREEN="$(tput setaf 2)"
RED="$(tput setaf 1)"
RESET="$(tput sgr0)"

if [ ! -f .env ]; then
    echo "${RED}No .env file found!${RESET}"
    exit 1
fi

if [[ $( cat .env | grep -P '^[^#\s]' | awk -F '"' 'NF <= 2' | wc -l ) -ne 0 ]]; then 
    echo "${RED}Bad quoting found in .env!${RESET}"
    exit 1
else
    echo "${GREEN}.env is A-OK!${RESET}"
    exit 0
fi
