$langs = @("ja","ko","th","ru","ar","fa")
foreach ($l in $langs) {
  echo "=== scanning $l $(Get-Date -Format HH:mm:ss) ==="
  node .audit/scan_full_pages.mjs --focus=quick --lang=$l --out=.audit/scan_v2_$l.txt 2>&1 | Select-Object -Last 2
}
echo "ALL SCANS DONE $(Get-Date -Format HH:mm:ss)"
