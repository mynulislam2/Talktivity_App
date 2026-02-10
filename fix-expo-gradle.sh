#!/bin/bash

# Function to patch a build.gradle file
patch_gradle() {
  local file=$1
  echo "Checking $file..."
  
  # Check if file has compileSdkVersion (deprecated) and needs to be compileSdk
  if grep -q "compileSdkVersion" "$file"; then
    echo "Patching $file..."
    # Replace compileSdkVersion with compileSdk
    sed -i 's/compileSdkVersion/compileSdk/g' "$file"
    echo "✓ Patched $file"
  fi
}

# Patch all expo modules
for f in node_modules/expo-*/android/build.gradle; do
  if [ -f "$f" ]; then
    patch_gradle "$f"
  fi
done

echo "Done!"
