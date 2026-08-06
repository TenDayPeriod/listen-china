param(
    [string]$TempDir = "public\.img-tmp",
    [string]$TargetRoot = "public\img"
)
$ErrorActionPreference = 'Continue'

$absTemp = (Resolve-Path -LiteralPath $TempDir).Path
$absRoot = (Resolve-Path -LiteralPath $TargetRoot).Path

$files = Get-ChildItem -LiteralPath $absTemp -Recurse -File
$ok = 0; $fail = 0
$totalOrig = 0L; $totalNew = 0L

foreach ($f in $files) {
    $rel = $f.FullName.Substring($absTemp.Length).TrimStart('\','/')
    $target = Join-Path $absRoot $rel
    $bak    = $target + '.__bak__'
    $origLen = 0L
    $targetExists = Test-Path -LiteralPath $target
    if ($targetExists) { $origLen = (Get-Item -LiteralPath $target).Length }

    try {
        if ($targetExists) {
            Rename-Item -LiteralPath $target -NewName (Split-Path -Leaf $bak) -Force -ErrorAction Stop
        }
        Move-Item -LiteralPath $f.FullName -Destination $target -Force -ErrorAction Stop
        if (Test-Path -LiteralPath $bak) { Remove-Item -LiteralPath $bak -Force -ErrorAction SilentlyContinue }

        $after = Get-Item -LiteralPath $target
        $saved = if ($origLen -gt 0) { (1 - [double]$after.Length / $origLen) * 100 } else { 0 }
        $totalOrig += $origLen; $totalNew += $after.Length
        $display = if ($rel.Length -gt 55) { '...' + $rel.Substring($rel.Length - 52) } else { $rel }
        $line = "OK  {0} {1,6}KB -> {2,6}KB  -{3}%" -f $display.PadRight(55),
            [math]::Round($origLen/1KB,0), [math]::Round($after.Length/1KB,0), $saved.ToString('0.0')
        Write-Host $line
        $ok++
    } catch {
        if ((Test-Path -LiteralPath $bak) -and -not (Test-Path -LiteralPath $target)) {
            try { Rename-Item -LiteralPath $bak -NewName (Split-Path -Leaf $target) -Force -ErrorAction SilentlyContinue } catch {}
        }
        $msg = $_.Exception.Message.Split([Environment]::NewLine)[0]
        Write-Host "FAIL ${rel}: $msg"
        $fail++
    }
}

$savedPct = if ($totalOrig -gt 0) { ((1 - $totalNew / $totalOrig) * 100).ToString('0.0') } else { '0.0' }
Write-Host ("`nSuccess: {0}, Failed: {1}" -f $ok, $fail)
Write-Host ("Batch: {0:N2}MB -> {1:N2}MB, saved {2}% ({3:N2}MB)" -f ($totalOrig/1MB), ($totalNew/1MB), $savedPct, (($totalOrig-$totalNew)/1MB))
