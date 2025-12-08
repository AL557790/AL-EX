#!/bin/bash

while read module; do
  if [ ! -z "$module" ]; then
    echo "Installing $module..."
    npm install "$module"
  fi
done < modules.txt