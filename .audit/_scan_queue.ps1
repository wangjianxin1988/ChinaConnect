$ErrorActionPreference = 'Continue'
$log = '.audit\_scanqueue.log'
function Log($msg) { $ts = Get-Date -Format 'HH:mm:ss'; Add-Content -Path $log -Value "$ts $msg" }
function Run-Batch($langs) {
  foreach ($l in $langs) {
    Log "START $l"
    $p = Start-Process -FilePath "node" -ArgumentList ".audit/scan_full_pages_load.mjs","--focus=all","--lang=$l","--out=.audit/scan_final_$l.txt" -WorkingDirectory "D:\suoyouxiangmu\chinaconnect" -RedirectStandardOutput ".audit\_scanlog_$l.log" -RedirectStandardError ".audit\_scanerr_$l.log" -WindowStyle Hidden -PassThru
    $p.WaitForExit()
    if (Test-Path ".audit/scan_final_$l.txt") { Log "DONE $l size=$((Get-Item ".audit/scan_final_$l.txt").Length)" } else { Log "FAIL $l (no output)" }
    if (Test-Path ".audit\_scanerr_$l.log") { $err = Get-Content ".audit\_scanerr_$l.log" -Raw; if ($err.Trim()) { Log "ERRLOG $l : $($err.Substring(0,[Math]::Min(200,$err.Length)))" } }
  }
}
Log "QUEUE START"
Run-Batch @('ar','fa','zh-CN')
Run-Batch @('zh-TW','ja','ko')
Run-Batch @('th','vi')
Log "QUEUE ALL DONE"
