Remove-Item -LiteralPath "src/data/emergency/global-contacts.ts.bak" -Force -ErrorAction SilentlyContinue
curl.exe -s "http://127.0.0.1:4322/offline" -o .audit/_offline.html
$t = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes((Resolve-Path .audit/_offline.html)))
Write-Output ("offline closing=" + $t.Contains("</html>") + " len=" + $t.Length)
$cjk = [regex]::Matches($t, "[\u4e00-\u9fff]{2,}") | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Output ("CJK phrases in offline EN page: " + $cjk.Count)
$cjk | Select-Object -First 10
