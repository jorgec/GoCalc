#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Hash a supplied password using SHA-256 and save it to a file named "password".

.DESCRIPTION
    This script checks if a parameter was provided; if not, it prints usage and exits.
    Otherwise, it computes the SHA-256 hash of the string and saves the result to the "password" file.

.EXAMPLE
    .\passgen.ps1 'MySecretPassword'
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Password
)

if (!$Password) {
    Write-Host "Usage: .\passgen.ps1 <password>"
    exit 1
}

# Compute the SHA-256 hash
$sha256 = New-Object System.Security.Cryptography.SHA256Managed
$hashBytes = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Password))
$hashString = [BitConverter]::ToString($hashBytes) -replace "-", "" | ForEach-Object { $_.ToLower() }

# Write the hash to "password" file
$hashString | Out-File -FilePath "password" -Encoding ASCII

Write-Host "Hash saved to 'password' file."