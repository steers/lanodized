#!/bin/bash
#
# Source this from your shell's runtime configuration file

alias pd='cd "$PROJECT_DIR"'

cat "${PROJECT_DIR}/data/logo.txt" || true
echo "Custom aliases for LANodized development:"
alias | tail -n+9 | awk '{sub("alias ",""); print "\t", $0}' | sort
echo

