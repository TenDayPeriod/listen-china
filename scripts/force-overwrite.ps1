# 用 robocopy /MOV  +  MoveFileExW  语义
param(
    [Parameter(Mandatory=$true)][string]$TempDir,
    [Parameter(Mandatory=$true)][string]$TargetRoot
)

$ErrorActionPreference = 'Continue'

$absTemp = (Resolve-Path -LiteralPath $TempDir).Path
$absRoot = (Resolve-Path -LiteralPath $TargetRoot).Path

$files = Get-ChildItem -LiteralPath $absTemp -Recurse -File
$ok = 0; $fail = 0

foreach ($f in $files) {
    $rel = $f.FullName.Substring($absTemp.Length).TrimStart('\','/')
    $target = Join-Path $absRoot $rel
    $targetDir = Split-Path -LiteralPath $target -Parent

    $origLen = (Get-Item -LiteralPath $target -ErrorAction SilentlyContinue).Length
    $newLen  = $f.Length

    # 策略 1：先把目标重命名（.winbak
    $bak = $target + '.__winbak__'
    $renamed = $false
    if (Test-Path -LiteralPath $target) {
        try {
            Rename-Item -LiteralPath $target -NewName (Split-Path -Leaf $bak) -Force -ErrorAction Stop
            $renamed = $true
        } catch {}
    }

    $moved = $false
    # 策略 2：cmd move /Y（同卷只改目录项）
    try {
        $out = cmd /c move /Y `"$($f.FullName)`" `"$target`" 2`>`&1
        if ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $target)) { $moved = $true }
    } catch {}

    if (-not $moved) {
        # 策略 3：robocopy 单文件移动（/MOV）
        try {
            $log = robocopy (Split-Path -LiteralPath $f.FullName -Parent) $targetDir ($f.Name) /MOV /R:0 /W:0 /NP 2`>&1
            if ($LASTEXITCODE -le 7 -and (Test-Path -LiteralPath $target)) { $moved = $true }
        } catch {}
    }

    if (-not $moved -and $renamed) {
        # 还原
        try { Rename-Item -LiteralPath $bak -NewName (Split-Path -Leaf $target) -Force -ErrorAction SilentlyContinue } catch {}
    }

    if ($moved) {
        try { Remove-Item -LiteralPath $bak -Force -ErrorAction SilentlyContinue } catch {}
        $ratio = if ($origLen) { -1 * (1 - [double]$newLen / $origLen) * 100 } else { 0 }
        $origKB = [math]::Round($origLen / 1KB, 0)
        $newKB  = [math]::Round($newLen / 1KB, 0)
        $display = if ($rel.Length -gt 55) { '...' + $rel.Substring($rel.Length - 52) } else { $rel }
        Write-Host ("OK  {0} {1,6}KB -> {2,6}KB  {3,6}%" -f $display.PadRight(55), $origKB, $newKB, $ratio.ToString('0.0'))
        $ok++
    } else {
        Write-Host "FAIL ${rel}: 所有策略均失败"
        $fail++
    }
}
Write-Host "`n成功 $ok，失败 $fail"
