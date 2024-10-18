#!/bin/bash

# Script: resize_screenshot.sh
# Description: Resizes images to 640x400 pixels and converts them to JPEG format.
# Usage: ./resize_screenshot.sh input_image [output_directory]

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null
then
    echo "⚠️  ImageMagick could not be found. Please install it first."
    exit 1
fi

# Check for at least one argument
if [ $# -lt 1 ]; then
    echo "Usage: ./resize_screenshot.sh input_image [output_directory]"
    exit 1
fi

INPUT_IMAGE="$1"

# Check if input file exists
if [ ! -f "$INPUT_IMAGE" ]; then
    echo "❌ Input file '$INPUT_IMAGE' does not exist."
    exit 1
fi

# Set output directory
OUTPUT_DIR="${2:-resized_screenshots}"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Get the base name of the input file (without extension)
BASE_NAME=$(basename "$INPUT_IMAGE" | cut -d. -f1)

# Define output file name
OUTPUT_FILE="${OUTPUT_DIR}/${BASE_NAME}_640x400.jpg"

# Resize and convert the image
echo "🔄 Resizing '$INPUT_IMAGE' to 640x400 and converting to JPEG..."
magick convert "$INPUT_IMAGE" -resize 640x400\! "$OUTPUT_FILE"

echo "✅ Successfully created '$OUTPUT_FILE'"
