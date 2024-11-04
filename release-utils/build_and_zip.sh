#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Variables
BUILD_DIR="build"
ZIP_DIR="build_zips"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Extract version from package.json
VERSION=$(grep '"version":' ./public/manifest.json | sed -E 's/.*"version": "(.*)",/\1/')

# Define the ZIP file name
ZIP_NAME="productivity_toolbox_v${VERSION}_${TIMESTAMP}.zip"

# Create build_zips directory if it doesn't exist
mkdir -p $ZIP_DIR

# Build the project
echo "🚀 Building the project..."
pnpm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory '$BUILD_DIR' does not exist. Build may have failed."
  exit 1
fi

# Navigate to the build directory
cd $BUILD_DIR

# Remove any existing ZIP files in the build_zips directory to prevent clutter
# Uncomment the following line if you want to remove old ZIPs
# rm -f ../$ZIP_DIR/*.zip

# Zip the contents of the build directory
echo "📦 Zipping the build files into $ZIP_NAME..."
zip -r "../$ZIP_DIR/$ZIP_NAME" ./* > /dev/null

# Navigate back to the project root
cd ..

echo "✅ Build zipped successfully at $ZIP_DIR/$ZIP_NAME"
