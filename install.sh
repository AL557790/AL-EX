#!/bin/bash

echo "👉 Checking & installing dependencies from install.txt..."

while read package || [ -n "$package" ]; do
  if [ ! -z "$package" ]; then
    echo ""
    echo "🔍 Checking $package ..."

    # هل المكتبة مثبتة مسبقًا؟
    if npm list "$package" >/dev/null 2>&1; then
      echo "✔️ $package is already installed. Skipping..."
    else
      echo "📦 Installing $package ..."
      npm install "$package"
    fi
  fi
done < install.txt

echo ""
echo "✅ Finished! All required packages are now installed."