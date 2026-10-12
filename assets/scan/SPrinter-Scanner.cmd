@echo off
rem  S Printer - Scanner helper for Windows
rem  Lets the S Printer website scan straight from your printer's scanner (HP, Canon, Epson, Brother ...).
rem  It uses Windows' own scanning (the same as the Windows Scan app), listens only on this computer
rem  (127.0.0.1), and only answers the S Printer website. Nothing is uploaded anywhere.
rem  Close this window to stop it.
title S Printer - Scanner helper
set "SPHELPER=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -STA -Command "$s=[IO.File]::ReadAllText($env:SPHELPER); $i=$s.IndexOf('#'+'PS-BEGIN'); iex $s.Substring($i)"
if errorlevel 2 pause
exit /b
#PS-BEGIN
$ErrorActionPreference = 'Stop'
$Port = 47321
$Version = '1.2'
$Sites = @('https://premiumappsfree.github.io')
$UpdateUrl = 'https://premiumappsfree.github.io/sprinter/assets/scan/SPrinter-Scanner.cmd'
$Home2 = Join-Path $env:LOCALAPPDATA 'SPrinter'
New-Item -ItemType Directory -Force -Path $Home2 | Out-Null
$TempDir = Join-Path $env:TEMP 'SPrinterScan'
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
Get-ChildItem $TempDir -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
$LogFile = Join-Path $Home2 'helper.log'
$Pages = @{}
$Last = @()

function Say($t, $c) {
  if (-not $c) { $c = 'Gray' }
  Write-Host ("  " + $t) -ForegroundColor $c
  try { Add-Content -Path $LogFile -Value ((Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '  ' + $t) } catch {}
}
function OriginOk($o) {
  if (-not $o) { return $false }
  if ($Sites -contains $o) { return $true }
  return ($o -match '^http://(localhost|127\.0\.0\.1)(:\d+)?$')
}
function Hex($n) { try { return ('0x{0:X8}' -f [int]$n) } catch { return [string]$n } }

# ======================= Windows scanning =======================
# 1) WinRT ImageScanner: what the Windows Scan app uses (works with eSCL / "driverless" scanners on Windows 10/11)
$script:rt = $null
function RT-Init {
  if ($script:rt -ne $null) { return $script:rt }
  try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $null = [Windows.Devices.Scanners.ImageScanner, Windows.Devices.Scanners, ContentType = WindowsRuntime]
    $null = [Windows.Devices.Enumeration.DeviceInformation, Windows.Devices.Enumeration, ContentType = WindowsRuntime]
    $null = [Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime]
    $ms = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 }
    $script:as1 = $ms | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
    $script:as2 = $ms | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperationWithProgress`2' } | Select-Object -First 1
    $script:rt = $true
  } catch { $script:rtErr = $_.Exception.Message; $script:rt = $false }
  return $script:rt
}
function Await1($op, [type]$t, $ms) {
  if (-not $ms) { $ms = 20000 }
  $task = $script:as1.MakeGenericMethod($t).Invoke($null, @($op))
  if (-not $task.Wait($ms)) { throw 'Windows did not answer in time.' }
  return $task.Result
}
function Await2($op, [type]$t, [type]$p, $ms) {
  $task = $script:as2.MakeGenericMethod($t, $p).Invoke($null, @($op))
  if (-not $task.Wait($ms)) { throw 'The scanner did not finish in time.' }
  return $task.Result
}
function RT-List {
  $out = @()
  if (-not (RT-Init)) { return ,$out }
  $sel = [Windows.Devices.Scanners.ImageScanner]::GetDeviceSelector()
  $devs = Await1 ([Windows.Devices.Enumeration.DeviceInformation]::FindAllAsync($sel)) ([Windows.Devices.Enumeration.DeviceInformationCollection])
  foreach ($d in $devs) { $out += @{ id = 'rt:' + $d.Id; name = [string]$d.Name; engine = 'Windows Scan'; enabled = [bool]$d.IsEnabled } }
  return ,$out
}
function RT-Scan($id, $dpi, $mode, $source) {
  if (-not (RT-Init)) { throw ('Windows Scan interface not available: ' + $script:rtErr) }
  $sc = Await1 ([Windows.Devices.Scanners.ImageScanner]::FromIdAsync($id)) ([Windows.Devices.Scanners.ImageScanner])
  if (-not $sc) { throw 'Windows could not open this scanner.' }
  $T = [Windows.Devices.Scanners.ImageScannerScanSource]
  $src = $T::Flatbed
  if ($source -eq 'feeder' -and $sc.IsScanSourceSupported($T::Feeder)) { $src = $T::Feeder }
  elseif (-not $sc.IsScanSourceSupported($T::Flatbed)) { $src = $T::Default }
  $cfg = $null
  if ($src -eq $T::Flatbed) { $cfg = $sc.FlatbedConfiguration } elseif ($src -eq $T::Feeder) { $cfg = $sc.FeederConfiguration }
  if ($cfg) {
    $F = [Windows.Devices.Scanners.ImageScannerFormat]
    foreach ($f in @($F::Png, $F::Jpeg, $F::DeviceIndependentBitmap, $F::Tiff)) { try { if ($cfg.IsFileFormatSupported($f)) { $cfg.Format = $f; break } } catch {} }
    $C = [Windows.Devices.Scanners.ImageScannerColorMode]
    $want = $C::Color; if ($mode -eq 'gray') { $want = $C::Grayscale }
    try { if ($cfg.IsColorModeSupported($want)) { $cfg.ColorMode = $want } } catch {}
    try {
      $r = $cfg.DesiredResolution; $r.DpiX = [single]$dpi; $r.DpiY = [single]$dpi
      $cfg.DesiredResolution = $r
    } catch {}
    try { if ($src -eq $T::Feeder) { $cfg.Duplex = $false; $cfg.MaxNumberOfPages = 0 } } catch {}
  }
  $folder = Await1 ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync($TempDir)) ([Windows.Storage.StorageFolder])
  $res = Await2 ($sc.ScanFilesToFolderAsync($src, $folder)) ([Windows.Devices.Scanners.ImageScannerScanResult]) ([uint32]) 90000
  $files = @()
  foreach ($f in $res.ScannedFiles) { $files += $f.Path }
  if (-not $files.Count) { throw 'The scanner returned no page.' }
  return ,(Fix-Files $files)
}

# 2) classic WIA (older drivers)
function Set-WiaProp($props, $id, $value) { foreach ($p in $props) { if ($p.PropertyID -eq $id) { try { $p.Value = $value } catch {}; return } } }
function Get-WiaProp($props, $id) { foreach ($p in $props) { if ($p.PropertyID -eq $id) { try { return $p.Value } catch { return $null } } }; return $null }
function WIA-List {
  $out = @()
  $dm = New-Object -ComObject WIA.DeviceManager
  foreach ($d in $dm.DeviceInfos) {
    if ($d.Type -ne 1) { continue }
    $name = ''; try { $name = [string]$d.Properties.Item('Name').Value } catch {}
    $out += @{ id = 'wia:' + [string]$d.DeviceID; name = $name; engine = 'WIA' }
  }
  return ,$out
}
function WIA-Message($hr) {
  switch ($hr) {
    0x80210002 { return 'Paper is jammed in the scanner.' }
    0x80210003 { return 'There is no paper in the document feeder.' }
    0x80210005 { return 'Windows says the scanner is offline.' }
    0x80210006 { return 'The scanner is busy (another app such as HP Smart may be using it).' }
    0x80210007 { return 'The scanner is warming up.' }
    0x8021000A { return 'The scanner needs your attention (check its screen).' }
    0x8021000C { return 'The scanner did not answer.' }
    0x80210015 { return 'No scanner was found.' }
    0x80210016 { return 'The scanner lid or cover is open.' }
    0x8021000E { return 'The HP scanner driver could not talk to the scanner.' }
    default { return $null }
  }
}
function Inner($err) { $e = $err.Exception; while ($e.InnerException) { $e = $e.InnerException }; return $e }
function Get-HResult($err) {
  $e = $err.Exception
  while ($e) { if ($e.HResult -and (($e.HResult -band 0xFFFF0000) -eq 0x80210000)) { return $e.HResult }; $e = $e.InnerException }
  return $err.Exception.HResult
}
function WIA-Scan($id, $dpi, $mode, $source, $style) {
  $dm = New-Object -ComObject WIA.DeviceManager
  $info = $null
  foreach ($d in $dm.DeviceInfos) { if ($d.Type -eq 1 -and $d.DeviceID -eq $id) { $info = $d; break } }
  if (-not $info) { throw 'This scanner is not available.' }
  $dev = $info.Connect()
  $item = $dev.Items.Item(1)
  if ($style -ne 'plain') {
    if ($source -eq 'feeder') { Set-WiaProp $dev.Properties 3088 1 } else { Set-WiaProp $dev.Properties 3088 2 }
    $intent = 1; if ($mode -eq 'gray') { $intent = 2 }
    Set-WiaProp $item.Properties 6146 $intent
    Set-WiaProp $item.Properties 6147 $dpi
    Set-WiaProp $item.Properties 6148 $dpi
  }
  $bmp = '{B96B3CAB-0728-11D3-9D7B-0000F81EF32E}'
  $out = @()
  while ($true) {
    $img = $null
    try {
      if ($style -eq 'dialog') { $img = (New-Object -ComObject WIA.CommonDialog).ShowTransfer($item, $bmp, $false) }
      else { $img = $item.Transfer($bmp) }
    } catch {
      $hr = Get-HResult $_
      if ($hr -eq 0x80210003 -and $out.Count -gt 0) { break }
      throw
    }
    $f = Join-Path $TempDir ([guid]::NewGuid().ToString('N') + '.' + $img.FileExtension)
    $img.SaveFile($f); $out += $f
    if ($source -ne 'feeder' -or $out.Count -ge 60) { break }
  }
  return ,(Fix-Files $out)
}
# everything the browser gets is PNG (lossless) or JPEG
function Fix-Files($files) {
  $res = @()
  foreach ($f in $files) {
    $ext = [IO.Path]::GetExtension($f).ToLower()
    if ($ext -eq '.png' -or $ext -eq '.jpg' -or $ext -eq '.jpeg') { $res += $f; continue }
    Add-Type -AssemblyName System.Drawing
    $im = [System.Drawing.Image]::FromFile($f); $png = [IO.Path]::ChangeExtension($f, '.png')
    if ($png -eq $f) { $png = $f + '.png' }
    $im.Save($png, [System.Drawing.Imaging.ImageFormat]::Png); $im.Dispose()
    Remove-Item $f -Force -ErrorAction SilentlyContinue
    $res += $png
  }
  return ,$res
}
function All-Scanners {
  $list = @(); $errs = @()
  try { $list += RT-List } catch { $errs += ('Windows Scan list: ' + $_.Exception.Message) }
  try { $list += WIA-List } catch { $errs += ('WIA list: ' + $_.Exception.Message) }
  return @{ list = $list; errors = $errs }
}
# try the chosen scanner first, then every other way to reach a scanner on this PC
function Do-Scan($want, $dpi, $mode, $source) {
  $all = (All-Scanners).list
  $order = @()
  foreach ($d in $all) { if ($d.id -eq $want) { $order += $d } }
  foreach ($d in $all) { if ($d.id -ne $want -and $d.id -like 'rt:*') { $order += $d } }
  foreach ($d in $all) { if ($d.id -ne $want -and $d.id -like 'wia:*') { $order += $d } }
  if (-not $order.Count) { throw 'No scanner was found. Turn the printer on and connect it.' }
  $tries = @()
  foreach ($d in $order) {
    $styles = @('rt')
    if ($d.id -like 'wia:*') { $styles = @('simple', 'plain') }
    foreach ($st in $styles) {
      $label = $d.name + ' [' + $d.engine + $(if ($st -ne 'rt') { '/' + $st } else { '' }) + ']'
      Say ('Trying ' + $label + ' ...') 'Cyan'
      try {
        if ($st -eq 'rt') { $files = RT-Scan $d.id.Substring(3) $dpi $mode $source }
        else { $files = WIA-Scan $d.id.Substring(4) $dpi $mode $source $st }
        Say ('  OK: ' + $files.Count + ' page(s) with ' + $label) 'Green'
        $script:Last = $tries + @(@{ way = $label; ok = $true })
        return @{ files = $files; way = $label; tries = $script:Last }
      } catch {
        $hr = Get-HResult $_; $m = WIA-Message $hr
        $msg = (Inner $_).Message; if ($m) { $msg = $m }
        if ($hr -eq 0x8021000E) { $msg = 'The HP scanner driver could not talk to the scanner.' }
        Say ('  failed: ' + $msg + ' (' + (Hex $hr) + ')') 'Yellow'
        $tries += @{ way = $label; ok = $false; error = $msg; code = (Hex $hr) }
        if ($hr -eq 0x80210003 -or $hr -eq 0x80210002 -or $hr -eq 0x80210016) { break }   # paper / lid: no use trying other ways
        if ($m -and $hr -eq 0x80210005) { break }                                       # offline: next scanner entry
      }
    }
  }
  $script:Last = $tries
  $e = New-Object Exception ('SCANFAIL'); $e.Data['tries'] = $tries; throw $e
}

# ======================= helper housekeeping =======================
$StartupLnk = $null
try { $StartupLnk = Join-Path ([Environment]::GetFolderPath('Startup')) 'S Printer Scanner.lnk' } catch {}
$HomeCopy = Join-Path $Home2 'SPrinter-Scanner.cmd'
function Is-Installed { try { return [bool]($StartupLnk -and (Test-Path $StartupLnk)) } catch { return $false } }
function Install-Startup {
  if ($env:SPHELPER -and ($env:SPHELPER -ne $HomeCopy)) { Copy-Item $env:SPHELPER $HomeCopy -Force }
  $ws = New-Object -ComObject WScript.Shell
  $lnk = $ws.CreateShortcut($StartupLnk)
  $lnk.TargetPath = $HomeCopy; $lnk.WorkingDirectory = $Home2; $lnk.WindowStyle = 7; $lnk.Description = 'S Printer - Scanner helper'; $lnk.Save()
}
function Uninstall-Startup { if ($StartupLnk -and (Test-Path $StartupLnk)) { Remove-Item $StartupLnk -Force } }
function Wia-Service { try { return [string](Get-Service stisvc).Status } catch { return 'unknown' } }
function Scan-Devices {
  $o = @()
  try {
    foreach ($d in (Get-PnpDevice -ErrorAction SilentlyContinue | Where-Object { $_.Class -eq 'Image' -or ($_.FriendlyName -match 'HP|Smart Tank|Scan|IPP|eSCL' -and $_.Class -match 'Image|USB|Printer|SoftwareDevice|PrintQueue') })) {
      $o += @{ name = [string]$d.FriendlyName; status = [string]$d.Status; cls = [string]$d.Class; id = [string]$d.InstanceId }
    }
  } catch {}
  return ,$o
}
function Self-Update {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $txt = (New-Object Net.WebClient).DownloadString($UpdateUrl + '?t=' + [DateTime]::UtcNow.Ticks)
  if (-not $txt.StartsWith('@echo off') -or $txt.IndexOf('#PS-BEGIN') -lt 0 -or $txt.IndexOf('S Printer - Scanner helper') -lt 0) { throw 'The downloaded helper does not look right.' }
  $txt = $txt -replace "`r?`n", "`r`n"
  $targets = @($HomeCopy); if ($env:SPHELPER) { $targets += $env:SPHELPER }
  foreach ($t in ($targets | Select-Object -Unique)) { try { [IO.File]::WriteAllText($t, $txt, (New-Object Text.ASCIIEncoding)) } catch {} }
  $run = $HomeCopy; if ($env:SPHELPER -and (Test-Path $env:SPHELPER)) { $run = $env:SPHELPER }
  Start-Process -FilePath 'cmd.exe' -ArgumentList ('/c start "S Printer - Scanner helper" /min "' + $run + '"') -WindowStyle Hidden
}

# ======================= tiny web server on 127.0.0.1 =======================
function J($o) {
  if ($null -eq $o) { return 'null' }
  if ($o -is [string]) { return '"' + ($o -replace '\\', '\\' -replace '"', '\"' -replace "`r", '\r' -replace "`n", '\n' -replace "`t", ' ') + '"' }
  if ($o -is [bool]) { if ($o) { return 'true' } else { return 'false' } }
  if ($o -is [int] -or $o -is [long] -or $o -is [double] -or $o -is [single]) { return [string]$o }
  if ($o -is [hashtable]) { $p = @(); foreach ($k in $o.Keys) { $p += (J ([string]$k)) + ':' + (J $o[$k]) }; return '{' + ($p -join ',') + '}' }
  if ($o -is [System.Collections.IEnumerable]) { $p = @(); foreach ($x in $o) { $p += (J $x) }; return '[' + ($p -join ',') + ']' }
  return (J ([string]$o))
}
function Send($stream, $code, $type, [byte[]]$body, $origin) {
  $txt = @{ 200 = 'OK'; 204 = 'No Content'; 400 = 'Bad Request'; 403 = 'Forbidden'; 404 = 'Not Found'; 500 = 'Error' }[$code]
  $h = "HTTP/1.1 $code $txt`r`nContent-Type: $type`r`nContent-Length: " + $body.Length + "`r`nCache-Control: no-store`r`nConnection: close`r`n"
  if ($origin) { $h += "Access-Control-Allow-Origin: $origin`r`nVary: Origin`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nAccess-Control-Allow-Private-Network: true`r`nAccess-Control-Max-Age: 600`r`n" }
  $h += "`r`n"
  $hb = [Text.Encoding]::ASCII.GetBytes($h)
  $stream.Write($hb, 0, $hb.Length)
  if ($body.Length) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}
function SendJson($stream, $code, $obj, $origin) { Send $stream $code 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes((J $obj))) $origin }

$script:Quit = $false
function Handle($client) {
  $client.ReceiveTimeout = 4000; $client.SendTimeout = 120000
  $s = $client.GetStream()
  $buf = New-Object byte[] 16384; $req = ''
  while ($req.IndexOf("`r`n`r`n") -lt 0 -and $req.Length -lt 65536) {
    $n = $s.Read($buf, 0, $buf.Length); if ($n -le 0) { break }
    $req += [Text.Encoding]::ASCII.GetString($buf, 0, $n)
  }
  $lines = $req -split "`r`n"
  $first = $lines[0] -split ' '
  if ($first.Count -lt 2) { return }
  $method = $first[0]; $target = $first[1]
  $hdr = @{}
  for ($li = 1; $li -lt $lines.Count; $li++) { $l = $lines[$li]; $k = $l.IndexOf(':'); if ($k -gt 0) { $hdr[$l.Substring(0, $k).Trim().ToLower()] = $l.Substring($k + 1).Trim() } }
  if ($hdr['host'] -notmatch ('^(127\.0\.0\.1|localhost):' + $Port + '$')) { SendJson $s 403 @{ ok = $false; error = 'bad host' } $null; return }
  $origin = $hdr['origin']
  $okOrigin = $null; if (OriginOk $origin) { $okOrigin = $origin }
  if ($origin -and -not $okOrigin) { SendJson $s 403 @{ ok = $false; error = 'This website is not allowed to use your scanner.' } $null; return }
  if ($method -eq 'OPTIONS') { Send $s 204 'text/plain' (New-Object byte[] 0) $okOrigin; return }
  $path = $target; $query = @{}
  $qi = $target.IndexOf('?')
  if ($qi -ge 0) {
    $path = $target.Substring(0, $qi)
    foreach ($kv in $target.Substring($qi + 1) -split '&') { $e = $kv.IndexOf('='); if ($e -gt 0) { $query[[Uri]::UnescapeDataString($kv.Substring(0, $e))] = [Uri]::UnescapeDataString($kv.Substring($e + 1).Replace('+', ' ')) } }
  }
  if ($path -ne '/status') { Say ($method + ' ' + $path) 'DarkGray' }
  if ($path -eq '/status') {
    $a = All-Scanners; $err = $null; if ($a.errors.Count -and -not $a.list.Count) { $err = ($a.errors -join ' | ') }
    SendJson $s 200 @{ ok = $true; app = 'sprinter-scan'; version = $Version; scanners = $a.list; error = $err; startup = (Is-Installed); wia = (Wia-Service) } $okOrigin
    return
  }
  if (-not $okOrigin) { SendJson $s 403 @{ ok = $false; error = 'Open the S Printer website to scan.' } $null; return }
  if ($path -eq '/scan') {
    $dpi = 300; try { $dpi = [int]$query['dpi'] } catch {}; if ($dpi -lt 75 -or $dpi -gt 1200) { $dpi = 300 }
    $mode = 'color'; if ($query['mode'] -eq 'gray') { $mode = 'gray' }
    $src = 'flatbed'; if ($query['source'] -eq 'feeder') { $src = 'feeder' }
    Say ("Scanning at $dpi dpi, $mode, $src ...") 'Cyan'
    try {
      $r = Do-Scan $query['id'] $dpi $mode $src
      $tokens = @()
      foreach ($f in $r.files) { $t = [guid]::NewGuid().ToString('N'); $Pages[$t] = $f; $tokens += $t }
      SendJson $s 200 @{ ok = $true; pages = $tokens; dpi = $dpi; way = $r.way; tries = $r.tries } $okOrigin
    } catch {
      $tries = $_.Exception.Data['tries']
      $m = $_.Exception.Message
      if ($tries) {
        $m = 'The scan did not work.'
        foreach ($t in $tries) { if ($t.error -match 'offline') { $m = 'Windows says the scanner is offline.' } }
        foreach ($t in $tries) { if ($t.error -match 'busy') { $m = 'The scanner is busy (close HP Smart or other scan apps).' } }
        foreach ($t in $tries) { if ($t.error -match 'paper|lid|cover') { $m = $t.error } }
      }
      Say ('Scan failed: ' + $m) 'Yellow'
      SendJson $s 500 @{ ok = $false; error = $m; tries = $tries; wia = (Wia-Service) } $okOrigin
    }
    return
  }
  if ($path -eq '/page') {
    $t = $query['t']; $f = $null; if ($t) { $f = $Pages[$t] }
    if (-not $f -or -not (Test-Path $f)) { SendJson $s 404 @{ ok = $false; error = 'gone' } $okOrigin; return }
    $type = 'image/png'; if ($f -match '\.jpe?g$') { $type = 'image/jpeg' }
    Send $s 200 $type ([IO.File]::ReadAllBytes($f)) $okOrigin
    $Pages.Remove($t); Remove-Item $f -Force -ErrorAction SilentlyContinue
    return
  }
  if ($path -eq '/log') {
    $l = @(); try { $l = @(Get-Content $LogFile -Tail 120) } catch {}
    SendJson $s 200 @{ ok = $true; version = $Version; log = $l; last = $script:Last; wia = (Wia-Service); devices = (Scan-Devices); os = [string][Environment]::OSVersion.VersionString; ps = [string]$PSVersionTable.PSVersion } $okOrigin
    return
  }
  if ($path -eq '/startup' -and $method -eq 'POST') {
    try { if ($query['on'] -eq '0') { Uninstall-Startup } else { Install-Startup }; SendJson $s 200 @{ ok = $true; startup = (Is-Installed) } $okOrigin }
    catch { SendJson $s 500 @{ ok = $false; error = $_.Exception.Message } $okOrigin }
    return
  }
  if ($path -eq '/repair' -and $method -eq 'POST') {
    # restart Windows' scanner service (asks Windows for permission)
    try {
      $fix = @'
$ErrorActionPreference = 'SilentlyContinue'
Set-Service stisvc -StartupType Automatic
Stop-Service stisvc -Force; Stop-Service WiaRpc -Force
Get-PnpDevice | Where-Object { $_.Class -eq 'Image' -or ($_.FriendlyName -match 'HP' -and $_.Class -match 'USB|SoftwareDevice') } | ForEach-Object { pnputil /restart-device "$($_.InstanceId)" | Out-Null }
Start-Sleep -Seconds 3
pnputil /scan-devices | Out-Null
Start-Service stisvc; Start-Service WiaRpc
'@
      $enc = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($fix))
      Start-Process -FilePath 'powershell.exe' -Verb RunAs -WindowStyle Hidden -ArgumentList ('-NoProfile -EncodedCommand ' + $enc)
      Say 'Repairing Windows scanning (service + scanner device restart) ...' 'Cyan'
      SendJson $s 200 @{ ok = $true } $okOrigin
    } catch { SendJson $s 500 @{ ok = $false; error = 'Permission was not given.' } $okOrigin }
    return
  }
  if ($path -eq '/update' -and $method -eq 'POST') {
    # the new copy starts, closes this window (and its cmd) and takes over the port
    try { Self-Update; SendJson $s 200 @{ ok = $true; from = $Version } $okOrigin; Say 'Updating the helper ...' 'Cyan' }
    catch { SendJson $s 500 @{ ok = $false; error = $_.Exception.Message } $okOrigin }
    return
  }
  SendJson $s 404 @{ ok = $false; error = 'not found' } $okOrigin
}

# ======================= start =======================
# an older copy of the helper may still be running: close it and take over
function Stop-Old {
  try {
    $me = $PID
    $old = Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.ProcessId -ne $me -and $_.CommandLine -and $_.CommandLine.Contains("'#'+'PS-BEGIN'") }
    foreach ($p in $old) {
      $par = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $p.ParentProcessId) -ErrorAction SilentlyContinue
      Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
      if ($par -and $par.Name -eq 'cmd.exe') { Stop-Process -Id $par.ProcessId -Force -ErrorAction SilentlyContinue }
    }
  } catch {}
}
$listener = $null
for ($try = 0; $try -lt 30; $try++) {
  try { $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port); $listener.Start(); break }
  catch { $listener = $null; if ($try -eq 1) { Stop-Old }; Start-Sleep -Milliseconds 500 }
}
if (-not $listener) { Say 'Could not start: port 47321 is in use by another program.' 'Red'; Start-Sleep -Seconds 8; exit 2 }
# keep the auto-start copy up to date
try { if ((Is-Installed) -and $env:SPHELPER -and ($env:SPHELPER -ne $HomeCopy)) { Copy-Item $env:SPHELPER $HomeCopy -Force } } catch {}
Write-Host ''
Say ('S Printer - Scanner helper ' + $Version + ' is ON') 'Green'
Say 'Keep this window open (you can minimise it), then press "Scan from printer" on the S Printer website.'
Say 'It works only on this computer and only for the S Printer website. Close this window to stop.'
try { $a = All-Scanners; foreach ($d in $a.list) { Say ('Scanner: ' + $d.name + ' [' + $d.engine + ']') 'Green' }; if (-not $a.list.Count) { Say 'No scanner found yet - turn the printer on.' 'Yellow' } } catch {}
Say ('Windows scanner service: ' + (Wia-Service))
Write-Host ''
# serve: idle connections (browsers open spare ones) never block the others
$clients = New-Object System.Collections.ArrayList
while (-not $script:Quit) {
  while ($listener.Pending()) { [void]$clients.Add(@{ c = $listener.AcceptTcpClient(); t = [DateTime]::UtcNow }) }
  $ready = $null
  foreach ($e in @($clients)) {
    $alive = $true
    try { if ($e.c.Available -gt 0) { $ready = $e; break } } catch { $alive = $false }
    if (-not $alive -or ([DateTime]::UtcNow - $e.t).TotalSeconds -gt 20) { $clients.Remove($e); try { $e.c.Close() } catch {} }
  }
  if ($ready) {
    $clients.Remove($ready)
    try { Handle $ready.c } catch { try { Say ('Error: ' + $_.Exception.Message) 'Yellow' } catch {} } finally { try { $ready.c.Close() } catch {} }
  } else { Start-Sleep -Milliseconds 15 }
}
$listener.Stop()
exit 0
