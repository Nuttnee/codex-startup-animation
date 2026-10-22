param([string]$OutputDirectory)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot
if (!$OutputDirectory) { $OutputDirectory=Join-Path $root 'dist/Codex-Startup-Windows' }
$destination=[IO.Path]::GetFullPath($OutputDirectory)
if ($destination -eq $root -or $root.StartsWith($destination+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Output must not be the source directory or its parent.' }
New-Item -ItemType Directory -Path $destination -Force | Out-Null
foreach ($folder in @('assets','extension','windows','tools','docs')) { New-Item -ItemType Directory -Path (Join-Path $destination $folder) -Force | Out-Null }
$files=@('index.html','style.css','animation.js','image-settings.js','Launch-Windows.cmd','Preview-Windows.cmd','README-Windows.md','README.md','README-upstream.md','docs/settings-vi.png','docs/references.md','assets/avatar.jpg','assets/artwork.jpg','assets/contours.js','extension/cdp.mjs','extension/payload.mjs','extension/renderer.mjs','extension/wallpaper.css','extension/windows.mjs','windows/platform.ps1','windows/Launch.ps1','tools/extension.test.mjs','tools/windows.test.mjs','tools/windows-smoke.mjs','tools/build-windows.ps1')
foreach ($file in $files) { Copy-Item -LiteralPath (Join-Path $root $file) -Destination (Join-Path $destination $file) -Force }
$archive=$destination+'.zip'
Compress-Archive -Path (Join-Path $destination '*') -DestinationPath $archive -Force
Write-Output $archive
