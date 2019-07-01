
# SilverStripe Team Custom Config:
GREEN="\[$(tput setaf 2)\]"
BLUE="\[$(tput setaf 4)\]"
RESET="\[$(tput sgr0)\]"
PROMPT_COMMAND='RET=$?;\
  BRANCH="";\
  if git branch &>/dev/null; then\
    BRANCH=\($(git branch 2>/dev/null | grep \* |  cut -d " " -f 2)\);\
  fi;
PS1="${GREEN}\u@sdlt1:${RESET}${BLUE} $BRANCH${RESET} $> ";'
