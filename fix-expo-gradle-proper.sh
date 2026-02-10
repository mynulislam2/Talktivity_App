#!/bin/bash

# Function to patch a build.gradle file properly
patch_gradle() {
  local file=$1
  echo "Patching $file..."
  
  # Replace all instances of compileSdk to be a proper android {} block definition
  # Change: compileSdk safeExtGet(...) 
  # To: compileSdk rootProject.ext.compileSdkVersion
  sed -i 's/compileSdk safeExtGet("compileSdk", safeExtGet("compileSdkVersion", [0-9]*)/compileSdk rootProject.ext.compileSdkVersion/g' "$file"
  sed -i 's/compileSdk safeExtGet("compileSdkVersion", [0-9]*)/compileSdk rootProject.ext.compileSdkVersion/g' "$file"
  
  echo "✓ Fixed $file"
}

# Patch all expo modules
for f in node_modules/expo-*/android/build.gradle; do
  if [ -f "$f" ]; then
    patch_gradle "$f"
  fi
done

echo "Done!"
