@echo off
rem  S Printer - Scanner helper for Windows
rem  Lets the S Printer website scan straight from your printer's scanner (HP, Canon, Epson, Brother ...).
rem  It uses the normal Windows scanner driver (WIA), listens only on this computer (127.0.0.1),
rem  and only answers the S Printer website. Nothing is uploaded anywhere. Close this window to stop it.
title S Printer - Scanner helper
set "SPHELPER=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -STA -Command "$s=[IO.File]::ReadAllText($env:SPHELPER); $i=$s.IndexOf('#'+'PS-BEGIN'); iex $s.Substring($i)"
if errorlevel 1 pause
exit /b
#PS-BEGIN
$ErrorActionPreference = 'Stop'
$Port = 47321
$Version = '1.0'
$Sites = @('https://premiumappsfree.github.io')
$TempDir = Join-Path $env:TEMP 'SPrinterScan'
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
Get-ChildItem $TempDir -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
$Pages = @{}

function Say($t, $c) { if (-not $c) { $c = 'Gray' }; Write-Host ("  " + $t) -ForegroundColor $c }

function OriginOk($o) {
  if (-not $o) { return $false }
  if ($Sites -contains $o) { return $true }
  return ($o -match '^http://(localhost|127\.0\.0\.1)(:\d+)?$')
}

# ---------------- scanner (WIA) ----------------
function Set-WiaProp($props, $id, $value) {
  foreach ($p in $props) { if ($p.PropertyID -eq $id) { try { $p.Value = $value } catch {} ; return } }
}
function Get-WiaProp($props, $id) {
  foreach ($p in $props) { if ($p.PropertyID -eq $id) { try { return $p.Value } catch { return $null } } }
  return $null
}
function Get-Scanners {
  $list = @()
  $dm = New-Object -ComObject WIA.DeviceManager
  foreach ($d in $dm.DeviceInfos) {
    if ($d.Type -ne 1) { continue }
    $name = ''
    try { $name = [string]$d.Properties.Item('Name').Value } catch {}
    $list += @{ id = [string]$d.DeviceID; name = $name }
  }
  return ,$list
}
function Wia-Message($hr) {
  switch ($hr) {
    0x80210002 { return 'Paper is jammed in the scanner.' }
    0x80210003 { return 'There is no paper in the document feeder.' }
    0x80210005 { return 'The scanner is off or not connected. Turn it on and try again.' }
    0x80210006 { return 'The scanner is busy (another app such as HP Smart may be using it). Close it and try again.' }
    0x80210007 { return 'The scanner is warming up. Wait a few seconds and try again.' }
    0x8021000A { return 'The scanner needs your attention (check its screen).' }
    0x8021000C { return 'The scanner did not answer. Check the cable / Wi-Fi and try again.' }
    0x80210015 { return 'No scanner was found. Turn it on and connect it to this computer.' }
    0x80210016 { return 'The scanner lid or cover is open.' }
    0x80210017 { return 'The scanner lamp is off.' }
    default { return $null }
  }
}
function Get-HResult($err) {
  $e = $err.Exception
  while ($e) { if ($e.HResult -and ($e.HResult -band 0xFFFF0000) -eq 0x80210000) { return $e.HResult }; $e = $e.InnerException }
  return $err.Exception.HResult
}
function Invoke-Scan($id, $dpi, $mode, $source) {
  $dm = New-Object -ComObject WIA.DeviceManager
  $info = $null
  foreach ($d in $dm.DeviceInfos) { if ($d.Type -eq 1 -and ((-not $id) -or $d.DeviceID -eq $id)) { $info = $d; break } }
  if (-not $info) { throw 'No scanner was found. Turn it on and connect it to this computer.' }
  $dev = $info.Connect()
  if ($source -eq 'feeder') { Set-WiaProp $dev.Properties 3088 1 } else { Set-WiaProp $dev.Properties 3088 2 }
  $item = $dev.Items.Item(1)
  $intent = 1; $dtype = 3
  if ($mode -eq 'gray') { $intent = 2; $dtype = 2 }
  Set-WiaProp $item.Properties 6146 $intent      # current intent: colour / greyscale
  Set-WiaProp $item.Properties 4103 $dtype       # data type
  Set-WiaProp $item.Properties 6147 $dpi         # horizontal resolution
  Set-WiaProp $item.Properties 6148 $dpi         # vertical resolution
  # the whole glass
  $bw = Get-WiaProp $dev.Properties 3074; $bh = Get-WiaProp $dev.Properties 3075
  if ($source -eq 'feeder') { $fw = Get-WiaProp $dev.Properties 3076; $fh = Get-WiaProp $dev.Properties 3077; if ($fw) { $bw = $fw }; if ($fh) { $bh = $fh } }
  Set-WiaProp $item.Properties 6149 0
  Set-WiaProp $item.Properties 6150 0
  if ($bw -and $bh) {
    Set-WiaProp $item.Properties 6151 ([int][math]::Floor($bw / 1000.0 * $dpi))
    Set-WiaProp $item.Properties 6152 ([int][math]::Floor($bh / 1000.0 * $dpi))
  }
  $out = @()
  while ($true) {
    $img = $null
    try { $img = $item.Transfer('{B96B3CAF-0728-11D3-9D7B-0000F81EF32E}') }   # PNG (lossless)
    catch {
      $hr = Get-HResult $_
      if ($hr -eq 0x80210003 -and $out.Count -gt 0) { break }                   # feeder empty: done
      if ((Wia-Message $hr) -ne $null) { throw (Wia-Message $hr) }
      $img = $item.Transfer()                                                    # driver's own format
    }
    $f = Join-Path $TempDir ([guid]::NewGuid().ToString('N') + '.' + $img.FileExtension)
    $img.SaveFile($f)
    if ($img.FileExtension -ne 'png' -and $img.FileExtension -ne 'jpg') {
      Add-Type -AssemblyName System.Drawing
      $bmp = [System.Drawing.Image]::FromFile($f); $png = $f + '.png'
      $bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose(); Remove-Item $f -Force; $f = $png
    }
    $out += $f
    if ($source -ne 'feeder' -or $out.Count -ge 60) { break }
  }
  return ,$out
}
function Install-Startup {
  $dir = Join-Path $env:LOCALAPPDATA 'SPrinter'; New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $dst = Join-Path $dir 'SPrinter-Scanner.cmd'
  if ($env:SPHELPER -and ($env:SPHELPER -ne $dst)) { Copy-Item $env:SPHELPER $dst -Force }
  $ws = New-Object -ComObject WScript.Shell
  $lnk = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Startup')) 'S Printer Scanner.lnk'))
  $lnk.TargetPath = $dst; $lnk.WorkingDirectory = $dir; $lnk.WindowStyle = 7; $lnk.Description = 'S Printer - Scanner helper'; $lnk.Save()
}
function Uninstall-Startup {
  $l = Join-Path ([Environment]::GetFolderPath('Startup')) 'S Printer Scanner.lnk'
  if (Test-Path $l) { Remove-Item $l -Force }
}
function Is-Installed { try { return (Test-Path (Join-Path ([Environment]::GetFolderPath('Startup')) 'S Printer Scanner.lnk')) } catch { return $false } }

# ---------------- tiny web server on 127.0.0.1 ----------------
function J($o) {
  if ($null -eq $o) { return 'null' }
  if ($o -is [string]) { return '"' + ($o -replace '\\', '\\' -replace '"', '\"' -replace "`r", '\r' -replace "`n", '\n' -replace "`t", ' ') + '"' }
  if ($o -is [bool]) { if ($o) { return 'true' } else { return 'false' } }
  if ($o -is [int] -or $o -is [long] -or $o -is [double]) { return [string]$o }
  if ($o -is [hashtable]) { $p = @(); foreach ($k in $o.Keys) { $p += (J ([string]$k)) + ':' + (J $o[$k]) }; return '{' + ($p -join ',') + '}' }
  if ($o -is [System.Collections.IEnumerable]) { $p = @(); foreach ($x in $o) { $p += (J $x) }; return '[' + ($p -join ',') + ']' }
  return (J ([string]$o))
}
function Send($stream, $code, $type, [byte[]]$body, $origin, $extra) {
  $txt = @{ 200 = 'OK'; 204 = 'No Content'; 400 = 'Bad Request'; 403 = 'Forbidden'; 404 = 'Not Found'; 500 = 'Error' }[$code]
  $h = "HTTP/1.1 $code $txt`r`nContent-Type: $type`r`nContent-Length: " + $body.Length + "`r`nCache-Control: no-store`r`nConnection: close`r`n"
  if ($origin) {
    $h += "Access-Control-Allow-Origin: $origin`r`nVary: Origin`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nAccess-Control-Allow-Private-Network: true`r`nAccess-Control-Max-Age: 600`r`n"
  }
  if ($extra) { $h += $extra }
  $h += "`r`n"
  $hb = [Text.Encoding]::ASCII.GetBytes($h)
  $stream.Write($hb, 0, $hb.Length)
  if ($body.Length) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}
function SendJson($stream, $code, $obj, $origin) { Send $stream $code 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes((J $obj))) $origin $null }

function Handle($client) {
  $client.ReceiveTimeout = 15000; $client.SendTimeout = 120000
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
  foreach ($l in $lines[1..($lines.Count - 1)]) { $k = $l.IndexOf(':'); if ($k -gt 0) { $hdr[$l.Substring(0, $k).Trim().ToLower()] = $l.Substring($k + 1).Trim() } }
  # only this computer's address (blocks DNS-rebinding tricks)
  if ($hdr['host'] -notmatch ('^(127\.0\.0\.1|localhost):' + $Port + '$')) { SendJson $s 403 @{ ok = $false; error = 'bad host' } $null; return }
  $origin = $hdr['origin']
  $okOrigin = $null; if (OriginOk $origin) { $okOrigin = $origin }
  if ($origin -and -not $okOrigin) { SendJson $s 403 @{ ok = $false; error = 'This website is not allowed to use your scanner.' } $null; return }
  if ($method -eq 'OPTIONS') { Send $s 204 'text/plain' (New-Object byte[] 0) $okOrigin $null; return }
  $path = $target; $query = @{}
  $qi = $target.IndexOf('?')
  if ($qi -ge 0) {
    $path = $target.Substring(0, $qi)
    foreach ($kv in $target.Substring($qi + 1) -split '&') { $e = $kv.IndexOf('='); if ($e -gt 0) { $query[[Uri]::UnescapeDataString($kv.Substring(0, $e))] = [Uri]::UnescapeDataString($kv.Substring($e + 1).Replace('+', ' ')) } }
  }
  if ($path -eq '/status') {
    $sc = @(); $err = $null
    try { $sc = Get-Scanners } catch { $err = 'Windows scanner service (WIA) is not available: ' + $_.Exception.Message }
    SendJson $s 200 @{ ok = $true; app = 'sprinter-scan'; version = $Version; scanners = $sc; error = $err; startup = (Is-Installed) } $okOrigin
    return
  }
  # everything below needs the S Printer page itself
  if (-not $okOrigin) { SendJson $s 403 @{ ok = $false; error = 'Open the S Printer website to scan.' } $null; return }
  if ($path -eq '/scan') {
    $dpi = 300; try { $dpi = [int]$query['dpi'] } catch {}; if ($dpi -lt 75 -or $dpi -gt 1200) { $dpi = 300 }
    $mode = 'color'; if ($query['mode'] -eq 'gray') { $mode = 'gray' }
    $src = 'flatbed'; if ($query['source'] -eq 'feeder') { $src = 'feeder' }
    Say ("Scanning at $dpi dpi, $mode, $src ...") 'Cyan'
    try {
      $files = Invoke-Scan $query['id'] $dpi $mode $src
      $tokens = @()
      foreach ($f in $files) { $t = [guid]::NewGuid().ToString('N'); $Pages[$t] = $f; $tokens += $t }
      Say ("Done: " + $tokens.Count + " page(s)") 'Green'
      SendJson $s 200 @{ ok = $true; pages = $tokens; dpi = $dpi } $okOrigin
    } catch {
      $m = Wia-Message (Get-HResult $_); if (-not $m) { $m = $_.Exception.Message }
      Say ("Scan failed: " + $m) 'Yellow'
      SendJson $s 500 @{ ok = $false; error = $m } $okOrigin
    }
    return
  }
  if ($path -eq '/page') {
    $t = $query['t']; $f = $null; if ($t) { $f = $Pages[$t] }
    if (-not $f -or -not (Test-Path $f)) { SendJson $s 404 @{ ok = $false; error = 'gone' } $okOrigin; return }
    $type = 'image/png'; if ($f -like '*.jpg') { $type = 'image/jpeg' }
    $bytes = [IO.File]::ReadAllBytes($f)
    Send $s 200 $type $bytes $okOrigin $null
    $Pages.Remove($t); Remove-Item $f -Force -ErrorAction SilentlyContinue
    return
  }
  if ($path -eq '/startup' -and $method -eq 'POST') {
    try { if ($query['on'] -eq '0') { Uninstall-Startup } else { Install-Startup }; SendJson $s 200 @{ ok = $true; startup = (Is-Installed) } $okOrigin }
    catch { SendJson $s 500 @{ ok = $false; error = $_.Exception.Message } $okOrigin }
    return
  }
  SendJson $s 404 @{ ok = $false; error = 'not found' } $okOrigin
}

# ---------------- start ----------------
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
try { $listener.Start() } catch {
  Write-Host ''
  Say 'The S Printer scanner helper is already running (or port 47321 is in use).' 'Yellow'
  Say 'You can close this window.' 'Yellow'
  Start-Sleep -Seconds 6; exit 0
}
Write-Host ''
Say 'S Printer - Scanner helper is ON' 'Green'
Say 'Keep this window open (you can minimise it), then press "Scan from printer" on the S Printer website.'
Say 'It works only on this computer and only for the S Printer website. Close this window to stop.'
try { $n = (Get-Scanners).Count; if ($n -gt 0) { Say ("Scanners found: " + $n) 'Green' } else { Say 'No scanner found yet - turn the printer on.' 'Yellow' } } catch { Say 'Windows scanner service (WIA) is not available on this computer.' 'Yellow' }
Write-Host ''
while ($true) {
  $c = $listener.AcceptTcpClient()
  try { Handle $c } catch { try { Say ('Error: ' + $_.Exception.Message) 'Yellow' } catch {} } finally { $c.Close() }
}
