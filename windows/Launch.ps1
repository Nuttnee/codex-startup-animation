param([string]$Executable, [switch]$Probe, [switch]$Preview)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
try {
    $arguments = @{ Action='Discover' }
    if ($Executable) { $arguments.Executable=$Executable }
    $info = (& "$PSScriptRoot/platform.ps1" @arguments) | ConvertFrom-Json
    if (!$info) { throw 'Không tìm được ứng dụng.' }
    if ($Probe) { $info | ConvertTo-Json -Depth 3; exit 0 }
    if ($Preview) { Start-Process (Join-Path (Split-Path $PSScriptRoot) 'index.html'); exit 0 }
    & $info.node (Join-Path (Split-Path $PSScriptRoot) 'extension/windows.mjs') --executable $info.executable
    exit $LASTEXITCODE
} catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }
