$ErrorActionPreference = 'Continue'
$log = '.audit\_scanqueue.log'
function Log($msg) { $ts = Get-Date -Format 'HH:mm:ss'; Add-Content -Path $log -Value "$ts $msg" }
function Wait-File($path) { while (-not (Test-Path $path)) { Start-Sleep -Seconds 10 } }
function Run-Par($langs) {
  $procs = @()
  foreach ($l in $langs) {
    Remove-Item ".audit/scan_final_$l.txt" -ErrorAction SilentlyContinue
    $p = Start-Process -FilePath "node" -ArgumentList ".audit/scan_full_pages_load.mjs","--focus=all","--lang=$l","--out=.audit/scan_final_$l.txt" -WorkingDirectory "D:\suoyouxiangmu\chinaconnect" -RedirectStandardOutput ".audit\_scanlog_$l.log" -RedirectStandardError ".audit\_scanerr_$l.log" -WindowStyle Hidden -PassThru
    $procs += @{ id = $p.Id; lang = $l }
    Log "START $l PID $($p.Id)"
  }
  foreach ($pr in $procs) { Wait-Process -Id $pr.id -ErrorAction SilentlyContinue }
  foreach ($pr in $procs) {
    if (Test-Path ".audit/scan_final_$($pr.lang).txt") { Log "DONE $($pr.lang) size=$((Get-Item ".audit/scan_final_$($pr.lang).txt").Length)" } else { Log "FAIL $($pr.lang)" }
    $err = Get-Content ".audit\_scanerr_$($pr.lang).log" -Raw -ErrorAction SilentlyContinue
    if ($err -and $err.Trim()) { Log "ERRLOG $($pr.lang): $($err.Substring(0,[Math]::Min(200,$err.Length)))" }
  }
}
Log "QUEUE2 START - waiting for ar (already running)"
Wait-File ".audit/scan_final_ar.txt"
Log "ar output present"
Run-Par @('fa','zh-CN','zh-TW')
Run-Par @('ja','ko','th')
Run-Par @('vi')
Log "QUEUE2 ALL DONE"
