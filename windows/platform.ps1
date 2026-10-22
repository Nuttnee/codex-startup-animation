param(
    [ValidateSet('Discover','Verify')][string]$Action = 'Discover',
    [string]$Executable,
    [int]$Port,
    [int]$ExpectedProcessId
)
$ErrorActionPreference = 'Stop'
# A Node child may inherit PowerShell 7's module path, incompatible with 5.1.
$env:PSModulePath = (Join-Path $PSHOME 'Modules') + ';' + (Join-Path $env:ProgramFiles 'WindowsPowerShell/Modules')
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

function Assert-Codex([string]$Path) {
    $resolved = (Resolve-Path -LiteralPath $Path).ProviderPath
    if ([IO.Path]::GetFileName($resolved) -notin @('ChatGPT.exe','Codex.exe')) { throw 'Đây không phải tệp chạy Codex dành cho máy tính.' }
    if (!(Test-Path -LiteralPath (Join-Path (Split-Path $resolved) 'resources/app.asar'))) { throw 'Không tìm thấy tài nguyên Codex dành cho máy tính (không hỗ trợ bản dòng lệnh).' }
    $signature = Get-AuthenticodeSignature -LiteralPath $resolved
    if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'O="?OpenAI (OpCo, LLC|,? ?L\.?L\.?C\.?)"?(,|$)') {
        throw 'Tệp chạy không có chữ ký OpenAI hợp lệ.'
    }
    return $resolved
}

try {
    if ($Action -eq 'Discover') {
        $candidates = @()
        if ($Executable) { $candidates += $Executable }
        else {
            $candidates += @(Get-Process ChatGPT,Codex -ErrorAction SilentlyContinue | ForEach-Object { $_.Path } | Where-Object { $_ })
            $candidates += @(Get-AppxPackage -Name '*Codex*' -ErrorAction SilentlyContinue | Sort-Object Version -Descending | ForEach-Object { Join-Path $_.InstallLocation 'app/ChatGPT.exe'; Join-Path $_.InstallLocation 'app/Codex.exe' })
            $candidates += @((Join-Path $env:LOCALAPPDATA 'Programs/Codex/Codex.exe'),(Join-Path $env:LOCALAPPDATA 'OpenAI/Codex/ChatGPT.exe'))
        }
        $found = $null
        foreach ($candidate in ($candidates | Select-Object -Unique)) {
            try { $found = Assert-Codex $candidate; break } catch { if ($Executable) { throw } }
        }
        if (!$found) { throw 'Không tìm thấy ứng dụng Codex có chữ ký hợp lệ. Dùng -Executable kèm đường dẫn đầy đủ.' }
        $running = @(Get-Process -Name ([IO.Path]::GetFileNameWithoutExtension($found)) -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $found } | ForEach-Object { $_.Id })
        $node = Join-Path (Split-Path $found) 'resources/cua_node/bin/node.exe'
        if (!(Test-Path -LiteralPath $node)) {
            $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
            if (!$nodeCommand) { throw 'Cần Node.js 22 trở lên; bản ứng dụng này không có Node đi kèm.' }
            $node = $nodeCommand.Source
        }
        @{ executable=$found; node=$node; running=$running; version=(Get-Item -LiteralPath $found).VersionInfo.ProductVersion } | ConvertTo-Json -Compress
    } else {
        if ($Port -lt 1 -or $ExpectedProcessId -lt 1) { throw 'Cần cung cấp cổng và mã tiến trình cần kiểm tra.' }
        $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop)
        if (!$listeners.Count) { throw 'Cổng gỡ lỗi chưa sẵn sàng.' }
        foreach ($listener in $listeners) {
            if ($listener.LocalAddress -ne '127.0.0.1') { throw 'Cổng gỡ lỗi không được giới hạn ở địa chỉ cục bộ IPv4.' }
            if ($listener.OwningProcess -ne $ExpectedProcessId) { throw 'Cổng gỡ lỗi thuộc một tiến trình khác.' }
            $process = Get-CimInstance Win32_Process -Filter "ProcessId=$ExpectedProcessId"
            if (!$process -or $process.ExecutablePath -ne $Executable) { throw 'Đường dẫn chương trình gỡ lỗi không khớp.' }
            $owner = Invoke-CimMethod -InputObject $process -MethodName GetOwnerSid
            if ($owner.ReturnValue -ne 0 -or $owner.Sid -ne [Security.Principal.WindowsIdentity]::GetCurrent().User.Value) { throw 'Tài khoản chạy tiến trình gỡ lỗi không khớp.' }
        }
        @{ verified=$true } | ConvertTo-Json -Compress
    }
} catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }
