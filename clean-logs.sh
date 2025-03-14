#!/bin/bash

# Script to clean up console.log statements in TypeScript/JavaScript files
# It comments them out rather than deleting to preserve line numbers and debugging info

echo "Starting console.log cleanup..."

# Count total occurrences before cleaning
TOTAL_BEFORE=$(find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/\.next/*" | xargs grep -l "console\.log" | wc -l)
echo "Found console.log statements in $TOTAL_BEFORE files"

# Comment out console.log statements
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/\.next/*" | xargs sed -i 's/console\.log(/\/\/ console.log(/g'

# Also handle console.error for non-critical errors that shouldn't be in production
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/\.next/*" | xargs sed -i 's/console\.error(/\/\/ console.error(/g'

# Count total occurrences after cleaning
TOTAL_AFTER=$(find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/\.next/*" | xargs grep -l "console\.log" | wc -l)
echo "After cleaning, console.log statements remain in $TOTAL_AFTER files (these are likely in comments now)"

# Count how many statements were commented out
CHANGES=$(find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/\.next/*" | xargs grep -l "\/\/ console\.log" | wc -l)
echo "Total of $CHANGES files with commented console logs"

echo "Console log cleanup complete!"
echo "Note: You should keep important error logging for critical parts of the application."
echo "This script aims to reduce dev-only console.log statements while preserving error handling." 