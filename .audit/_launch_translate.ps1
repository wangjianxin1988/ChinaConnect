$ErrorActionPreference = "SilentlyContinue"

function Launch-Lang([string]$lang) {
  $logFile = ".audit\\_translate_$($lang)_v2.log"
  $errFile = ".audit\\_translate_$($lang)_v2.err"
  Start-Process -FilePath "node.exe" -ArgumentList "scripts\translate-data-fast.mjs","--lang=$lang","--source-lang=en" `
    -WorkingDirectory "D:\suoyouxiangmu\chinaconnect" `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logFile `
    -RedirectStandardError $errFile
}

$langs = @("ja","ko","zh-CN","zh-TW","th","vi","ru","fr","de","ar","fa")
foreach ($lang in $langs) {
  Launch-Lang $lang
  Write-Host "Launched $lang"
}
