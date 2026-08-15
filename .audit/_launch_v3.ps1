$ErrorActionPreference = "SilentlyContinue"

function Launch-Lang([string]$lang) {
  $logFile = ".audit\\_translate_$($lang)_v3.log"
  $errFile = ".audit\\_translate_$($lang)_v3.err"
  Start-Process -FilePath "node.exe" -ArgumentList "scripts\translate-data-fast.mjs","--lang=$lang","--source-lang=en" `
    -WorkingDirectory "D:\suoyouxiangmu\chinaconnect" `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logFile `
    -RedirectStandardError $errFile
}

# Start with 6 langs to avoid API rate limit
$langs = @("ja", "ko", "zh-TW", "th", "fr", "de")
foreach ($lang in $langs) {
  Launch-Lang $lang
  Write-Host "Launched $lang"
}
Start-Sleep -Seconds 5
# Launch remaining 5 langs after a brief delay
$langs2 = @("vi", "ru", "ar", "fa", "zh-CN")
foreach ($lang in $langs2) {
  Launch-Lang $lang
  Write-Host "Launched $lang"
}
