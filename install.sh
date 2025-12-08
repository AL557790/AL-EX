#!/bin/bash

echo "👉 Installing dependencies from install.txt..."

while read package || [ -n "$package" ]; do
  if [ ! -z "$package" ]; then
    echo "📦 Installing $package ..."
    npm install "$package"
  fi
done < install.txt

echo "✅ All packages installed!"