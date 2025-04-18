#!/bin/bash

# Use LERNA_SINCE if set, otherwise default to main
SINCE_REF=${LERNA_SINCE:-main}

# Get the list of changed packages since the reference
changed=$(pnpx lerna list --since="$SINCE_REF" --json)

# Extract package locations
packages=$(echo "$changed" | jq -r '.[].location' | grep '/packages/' | sed 's|^|./|')

if [ -n "$packages" ]; then
  pnpx pkg-pr-new publish --pnpm $packages
fi