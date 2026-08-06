# 使用 Win32 MoveFileExW (MOVEFILE_REPLACE_EXISTING) 原子替换被锁文件
# 仅同驱动器内有效（.img-tmp 与 img 都在同盘）
param(
    [Parameter(Mandatory=$true)][string]$TempDir,
    [Parameter(Mandatory=$true)][string]$TargetRoot
)

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class Win32File {
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool MoveFileExW(string lpExistingFileName, string lpNewFileName, int dwFlags);
    public const int MOVEFILE_REPLACE_EXISTING = 0x00000001;
}
"@

function Move-Atom {
    param([string]$src, [string]$dst)
    $bak = $dst + '.__winbak__'
    # 先尝试把目标挪走（释放锁定的目录项链接）
    try { [Win32File]::MoveFileExW($dst, $bak, [Win32File]::MOVEFILE_REPLACE_EXISTING) | Out-Null } catch {}
    # Move temp -> target（创建新的目录项，内容指向临时文件）
    $ok = [Win32File]::MoveFileExW($src, $dst, [Win32File]::MOVEFILE_REPLACE_EXISTING)
    if (-not $ok) {
        $err = [System.Runtime.InteropServices.Marshal]::GetLastWin32Error()
        throw "MoveFileExW failed (err=$err): $src -> $dst"
    }
    # 删掉备份（可能因旧映射仍持有句柄而失败，不管它，后续再清理）
    try { Remove-Item -LiteralPath $bak -Force -ErrorAction SilentlyContinue } catch {}
}

$absTemp = (Resolve-Path -LiteralPath $TempDir).Path
$absRoot = (Resolve-Path -LiteralPath $TargetRoot).Path

$files = Get-ChildItem -LiteralPath $absTemp -Recurse -File
$ok = 0; $fail = 0

foreach ($f in $files) {
    $rel = $f.FullName.Substring($absTemp.Length).TrimStart('\','/')
    $target = Join-Path $absRoot $rel
    try {
        Move-Atom -src $f.FullName -dst $target
        $origLen = (Get-Item -LiteralPath $target -ErrorAction SilentlyContinue).Length
        $ratio = if ($origLen) { -1 * (1 - [double]$f.Length / $origLen) * 100 } else { 0 }
        $origKB = [math]::Round($origLen / 1KB, 0)
        $newKB  = [math]::Round($f.Length / 1KB, 0)
        $display = if ($rel.Length -gt 55) { '...' + $rel.Substring($rel.Length - 52) } else { $rel }
        Write-Host ("OK  {0} {1,6}KB -> {2,6}KB  {3,6}%" -f $display.PadRight(55), $origKB, $newKB, $ratio.ToString('0.0'))
        $ok++
    } catch {
        Write-Host "FAIL ${rel}: $($_.Exception.Message)"
        $fail++
    }
}
Write-Host "`n成功 $ok，失败 $fail"
