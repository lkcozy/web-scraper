#!/bin/bash

pr_log_name="PULLREQUESTLOG.md"
temp_file_name="temp"
start_datetime="2020-08-03T11:38:25Z"
base="main"
search_query="is:pr merged:>$start_datetime -author:app/dependabot"
merged_prs=$(
    gh pr list \
        --base $base \
        --search "$search_query" \
        --json author,title,url,mergedAt
    # --jq ".[]"
)
echo "$merged_prs"

if [ ! -f $pr_log_name ]; then
    touch $pr_log_name
fi

if [ -n "$merged_prs" ]; then
    prs=$(echo "$merged_prs" | jq -c '.[]')
    echo "$prs"
    echo -e "$(date +'## %Y-%m-%d (Week %V)')\n" >$temp_file_name
    counter=1
    while read -r line; do
        author=$(echo "$line" | jq -r '.author.login')
        title=$(echo "$line" | jq -r '.title')
        url=$(echo "$line" | jq -r '.url')
        echo "$counter. [$title]($url) @$author" >>$temp_file_name
        ((counter++))
    done <<<"$prs"

    echo -e "" >>$temp_file_name
    cat $pr_log_name >>$temp_file_name
    mv $temp_file_name $pr_log_name
fi
