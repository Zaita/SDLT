#!/bin/bash
echo "Running queued job at `date`"
source /var/www/html/cron_env
echo "Updating Path to include PHP binary"
export PATH=/usr/local/bin:$PATH
echo "Running SDLT Queued Jobs"
/var/www/html/vendor/bin/sake dev/tasks/ProcessJobQueueTask