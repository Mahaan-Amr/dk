# PowerShell script to clean up console.log statements in TypeScript/JavaScript files
# It comments them out rather than deleting to preserve line numbers and debugging info

Write-Host "Starting console.log cleanup..."

# Process each TypeScript/JavaScript file
Get-ChildItem -Path ".\src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file
    
    # Check if file contains console.log
    if ($content -match "console\.log\(") {
        Write-Host "Processing $file"
        
        # Replace console.log with commented version
        $newContent = $content -replace "console\.log\(", "// console.log("
        Set-Content -Path $file -Value $newContent
    }
    
    # Check if file contains console.error
    if ($content -match "console\.error\(") {
        Write-Host "Processing $file for console.error"
        
        # Replace console.error with commented version
        $newContent = Get-Content $file
        $newContent = $newContent -replace "console\.error\(", "// console.error("
        Set-Content -Path $file -Value $newContent
    }
}

Write-Host "Console log cleanup complete!"
Write-Host "Note: You should keep important error logging for critical parts of the application."
Write-Host "This script aims to reduce dev-only console.log statements while preserving error handling." 