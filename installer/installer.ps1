Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$repo = "wk12100lol-prog/vexcenter"
$appName = "VexCenter"
$tempDir = "$env:TEMP\vexcenter-installer"

$form = New-Object System.Windows.Forms.Form
$form.Text = "VexCenter Installer"
$form.Size = New-Object System.Drawing.Size(560, 400)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("$PSScriptRoot\assets\icon.ico")

$font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Font = $font
$form.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)

function Show-Step {
  param($id)
  $form.Controls.Clear()
  $form.Controls.Add($(switch ($id) {
    "welcome" { Step-Welcome }
    "progress" { Step-Progress }
    "done" { Step-Done }
    "error" { Step-Error }
  }))
  $form.Refresh()
}

# === STEP: WELCOME ===
function Step-Welcome {
  $panel = New-Object System.Windows.Forms.Panel
  $panel.Size = $form.ClientSize
  $panel.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)

  $lblTitle = New-Object System.Windows.Forms.Label
  $lblTitle.Text = "VexCenter"
  $lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Bold)
  $lblTitle.ForeColor = [System.Drawing.Color]::White
  $lblTitle.Size = New-Object System.Drawing.Size(400, 50)
  $lblTitle.Location = New-Object System.Drawing.Point(80, 60)
  $lblTitle.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblTitle)

  $lblSub = New-Object System.Windows.Forms.Label
  $lblSub.Text = "Platforma dystrybucji gier cyfrowych"
  $lblSub.Font = New-Object System.Drawing.Font("Segoe UI", 11)
  $lblSub.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
  $lblSub.Size = New-Object System.Drawing.Size(400, 30)
  $lblSub.Location = New-Object System.Drawing.Point(80, 110)
  $lblSub.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblSub)

  $lblVersion = New-Object System.Windows.Forms.Label
  $lblVersion.Name = "lblVersion"
  $lblVersion.Text = "Sprawdzanie wersji..."
  $lblVersion.Font = New-Object System.Drawing.Font("Segoe UI", 9)
  $lblVersion.ForeColor = [System.Drawing.Color]::FromArgb(120, 120, 140)
  $lblVersion.Size = New-Object System.Drawing.Size(400, 20)
  $lblVersion.Location = New-Object System.Drawing.Point(80, 150)
  $lblVersion.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblVersion)

  $btnInstall = New-Object System.Windows.Forms.Button
  $btnInstall.Name = "btnInstall"
  $btnInstall.Text = "Sprawdzanie..."
  $btnInstall.Size = New-Object System.Drawing.Size(300, 44)
  $btnInstall.Location = New-Object System.Drawing.Point(130, 200)
  $btnInstall.FlatStyle = "Flat"
  $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(124, 58, 237)
  $btnInstall.ForeColor = [System.Drawing.Color]::White
  $btnInstall.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
  $btnInstall.FlatAppearance.BorderSize = 0
  $btnInstall.Cursor = "Hand"
  $btnInstall.Enabled = $false
  $panel.Controls.Add($btnInstall)

  $btnExit = New-Object System.Windows.Forms.Button
  $btnExit.Text = "Zamknij"
  $btnExit.Size = New-Object System.Drawing.Size(300, 36)
  $btnExit.Location = New-Object System.Drawing.Point(130, 255)
  $btnExit.FlatStyle = "Flat"
  $btnExit.BackColor = [System.Drawing.Color]::FromArgb(40, 40, 60)
  $btnExit.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
  $btnExit.Font = New-Object System.Drawing.Font("Segoe UI", 10)
  $btnExit.Cursor = "Hand"
  $btnExit.Add_Click({ $form.Close() })
  $panel.Controls.Add($btnExit)

  # Start checking version async
  $btnInstall.UseWaitCursor = $true
  $script:downloadUrl = $null
  try {
    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add("User-Agent", "VexCenter-Installer")
    $json = $wc.DownloadString("https://api.github.com/repos/$repo/releases/latest")
    $r = $json | ConvertFrom-Json
    $asset = $r.assets | Where-Object { $_.name -like "*win-unpacked*" -and $_.name -like "*.zip" } | Select-Object -First 1
    if ($asset) {
      $lblVersion.Text = "Najnowsza wersja: $($r.tag_name)"
      $btnInstall.Text = "Pobierz VexCenter $($r.tag_name)"
      $btnInstall.Enabled = $true
      $script:downloadUrl = $asset.browser_download_url
      $btnInstall.Add_Click({ Show-Step "progress" })
    } else {
      $lblVersion.Text = "Nie znaleziono pliku instalacyjnego w wydaniu"
      $btnInstall.Text = "Spróbuj ponownie"
      $btnInstall.Enabled = $true
    }
  } catch {
    $lblVersion.Text = "Błąd: $($_.Exception.Message)"
    $btnInstall.Text = "Spróbuj ponownie"
    $btnInstall.Enabled = $true
  }
  $btnInstall.UseWaitCursor = $false

  return $panel
}

# === STEP: PROGRESS ===
function Step-Progress {
  $form.Size = New-Object System.Drawing.Size(560, 350)

  $panel = New-Object System.Windows.Forms.Panel
  $panel.Size = $form.ClientSize
  $panel.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)

  $lblTitle = New-Object System.Windows.Forms.Label
  $lblTitle.Text = "Pobieranie VexCenter..."
  $lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
  $lblTitle.ForeColor = [System.Drawing.Color]::White
  $lblTitle.Size = New-Object System.Drawing.Size(500, 40)
  $lblTitle.Location = New-Object System.Drawing.Point(30, 40)
  $panel.Controls.Add($lblTitle)

  $bar = New-Object System.Windows.Forms.ProgressBar
  $bar.Name = "progressBar"
  $bar.Size = New-Object System.Drawing.Size(500, 20)
  $bar.Location = New-Object System.Drawing.Point(30, 110)
  $bar.Style = "Continuous"
  $bar.ForeColor = [System.Drawing.Color]::FromArgb(124, 58, 237)
  $panel.Controls.Add($bar)

  $lblPct = New-Object System.Windows.Forms.Label
  $lblPct.Name = "lblPct"
  $lblPct.Text = "0%"
  $lblPct.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
  $lblPct.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 220)
  $lblPct.Size = New-Object System.Drawing.Size(500, 30)
  $lblPct.Location = New-Object System.Drawing.Point(30, 140)
  $lblPct.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblPct)

  $lblStatus = New-Object System.Windows.Forms.Label
  $lblStatus.Name = "lblStatus"
  $lblStatus.Text = "Przygotowanie..."
  $lblStatus.Font = New-Object System.Drawing.Font("Segoe UI", 9)
  $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(120, 120, 140)
  $lblStatus.Size = New-Object System.Drawing.Size(500, 20)
  $lblStatus.Location = New-Object System.Drawing.Point(30, 170)
  $lblStatus.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblStatus)

  $form.Refresh()

  # Start download async
  Start-Download

  return $panel
}

function Start-Download {
  $zipPath = "$tempDir\VexCenter-win-unpacked.zip"
  if (!(Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force | Out-Null }
  
  $wc = New-Object System.Net.WebClient
  $reg = [System.Text.RegularExpressions.Regex]::new("(\d+)\s+(\d+)\s+(\d+)")
  
  $wc.DownloadProgressChanged += {
    param($s, $e)
    $form.Controls[0].Controls["progressBar"].Value = $e.ProgressPercentage
    $form.Controls[0].Controls["lblPct"].Text = "$($e.ProgressPercentage)% ($([math]::Round($e.BytesReceived/1MB,1))/$([math]::Round($e.TotalBytesToReceive/1MB,1)) MB)"
    $form.Refresh()
  }

  $wc.DownloadFileCompleted += {
    param($s, $e)
    if ($e.Error) {
      $form.Controls[0].Controls["lblStatus"].Text = "Błąd pobierania: $($e.Error.Message)"
      Show-Step "error"
      return
    }
    $form.Controls[0].Controls["lblStatus"].Text = "Pobrano! Wypakowywanie..."
    $form.Refresh()
    Start-Extract $zipPath
  }

  try {
    $wc.Headers.Add("User-Agent", "VexCenter-Installer")
    $wc.DownloadFileAsync((New-Object System.Uri($script:downloadUrl)), $zipPath)
  } catch {
    Show-Error "Błąd: $($_.Exception.Message)"
  }
}

function Start-Extract($zipPath) {
  $folderDialog = New-Object System.Windows.Forms.FolderBrowserDialog
  $folderDialog.Description = "Wybierz folder docelowy dla VexCenter"
  $folderDialog.SelectedPath = "$env:ProgramFiles\VexCenter"
  
  if ($folderDialog.ShowDialog() -ne "OK") {
    Show-Error "Nie wybrano folderu."
    return
  }
  
  $targetDir = $folderDialog.SelectedPath
  if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
  
  try {
    $form.Controls[0].Controls["lblStatus"].Text = "Wypakowywanie do $targetDir ..."
    $form.Refresh()
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $targetDir, $true)
    
    # Create shortcut
    $exePath = "$targetDir\VexCenter.exe"
    if (Test-Path $exePath) {
      $wshell = New-Object -ComObject WScript.Shell
      $shortcut = $wshell.CreateShortcut("$env:USERPROFILE\Desktop\VexCenter.lnk")
      $shortcut.TargetPath = $exePath
      $shortcut.Description = "VexCenter - Platforma dystrybucji gier"
      $shortcut.Save()
    }
    
    Show-Step "done"
  } catch {
    Show-Error "Błąd wypakowywania: $($_.Exception.Message)"
  }
}

function Show-Error($msg) {
  $form.Controls[0].Controls["lblStatus"].Text = $msg
  Show-Step "error"
}

# === STEP: DONE ===
function Step-Done {
  $panel = New-Object System.Windows.Forms.Panel
  $panel.Size = $form.ClientSize
  $panel.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)

  $lblDone = New-Object System.Windows.Forms.Label
  $lblDone.Text = "✓"
  $lblDone.Font = New-Object System.Drawing.Font("Segoe UI", 48)
  $lblDone.ForeColor = [System.Drawing.Color]::FromArgb(16, 185, 129)
  $lblDone.Size = New-Object System.Drawing.Size(500, 60)
  $lblDone.Location = New-Object System.Drawing.Point(30, 50)
  $lblDone.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblDone)

  $lblTitle = New-Object System.Windows.Forms.Label
  $lblTitle.Text = "Instalacja zakończona!"
  $lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
  $lblTitle.ForeColor = [System.Drawing.Color]::White
  $lblTitle.Size = New-Object System.Drawing.Size(500, 40)
  $lblTitle.Location = New-Object System.Drawing.Point(30, 120)
  $lblTitle.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblTitle)

  $lblSub = New-Object System.Windows.Forms.Label
  $lblSub.Text = "VexCenter został zainstalowany. Skrót na pulpicie utworzony."
  $lblSub.Font = New-Object System.Drawing.Font("Segui UI", 10)
  $lblSub.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
  $lblSub.Size = New-Object System.Drawing.Size(500, 30)
  $lblSub.Location = New-Object System.Drawing.Point(30, 160)
  $lblSub.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblSub)

  $btnLaunch = New-Object System.Windows.Forms.Button
  $btnLaunch.Text = "Uruchom VexCenter"
  $btnLaunch.Size = New-Object System.Drawing.Size(250, 44)
  $btnLaunch.Location = New-Object System.Drawing.Point(155, 210)
  $btnLaunch.FlatStyle = "Flat"
  $btnLaunch.BackColor = [System.Drawing.Color]::FromArgb(16, 185, 129)
  $btnLaunch.ForeColor = [System.Drawing.Color]::White
  $btnLaunch.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
  $btnLaunch.Cursor = "Hand"
  $btnLaunch.Add_Click({
    $exe = "$env:ProgramFiles\VexCenter\VexCenter.exe"
    if (Test-Path $exe) { Start-Process $exe }
    $form.Close()
  })
  $panel.Controls.Add($btnLaunch)

  $btnClose = New-Object System.Windows.Forms.Button
  $btnClose.Text = "Zamknij"
  $btnClose.Size = New-Object System.Drawing.Size(250, 36)
  $btnClose.Location = New-Object System.Drawing.Point(155, 265)
  $btnClose.FlatStyle = "Flat"
  $btnClose.BackColor = [System.Drawing.Color]::FromArgb(40, 40, 60)
  $btnClose.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
  $btnClose.Font = New-Object System.Drawing.Font("Segoe UI", 10)
  $btnClose.Cursor = "Hand"
  $btnClose.Add_Click({ $form.Close() })
  $panel.Controls.Add($btnClose)

  return $panel
}

# === STEP: ERROR ===
function Step-Error {
  $panel = New-Object System.Windows.Forms.Panel
  $panel.Size = $form.ClientSize
  $panel.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)

  $lblX = New-Object System.Windows.Forms.Label
  $lblX.Text = "✕"
  $lblX.Font = New-Object System.Drawing.Font("Segoe UI", 48)
  $lblX.ForeColor = [System.Drawing.Color]::FromArgb(239, 68, 68)
  $lblX.Size = New-Object System.Drawing.Size(500, 60)
  $lblX.Location = New-Object System.Drawing.Point(30, 50)
  $lblX.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblX)

  $lblTitle = New-Object System.Windows.Forms.Label
  $lblTitle.Text = "Wystąpił błąd"
  $lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
  $lblTitle.ForeColor = [System.Drawing.Color]::White
  $lblTitle.Size = New-Object System.Drawing.Size(500, 40)
  $lblTitle.Location = New-Object System.Drawing.Point(30, 120)
  $lblTitle.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblTitle)

  $lblError = New-Object System.Windows.Forms.Label
  $lblError.Name = "lblError"
  $lblError.Text = $script:errorMsg
  $lblError.Font = New-Object System.Drawing.Font("Segoe UI", 9)
  $lblError.ForeColor = [System.Drawing.Color]::FromArgb(239, 68, 68)
  $lblError.Size = New-Object System.Drawing.Size(500, 40)
  $lblError.Location = New-Object System.Drawing.Point(30, 160)
  $lblError.TextAlign = "MiddleCenter"
  $panel.Controls.Add($lblError)

  $btnRetry = New-Object System.Windows.Forms.Button
  $btnRetry.Text = "Spróbuj ponownie"
  $btnRetry.Size = New-Object System.Drawing.Size(250, 44)
  $btnRetry.Location = New-Object System.Drawing.Point(155, 220)
  $btnRetry.FlatStyle = "Flat"
  $btnRetry.BackColor = [System.Drawing.Color]::FromArgb(124, 58, 237)
  $btnRetry.ForeColor = [System.Drawing.Color]::White
  $btnRetry.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
  $btnRetry.Cursor = "Hand"
  $btnRetry.Add_Click({ Show-Step "welcome" })
  $panel.Controls.Add($btnRetry)

  $btnClose = New-Object System.Windows.Forms.Button
  $btnClose.Text = "Zamknij"
  $btnClose.Size = New-Object System.Drawing.Size(250, 36)
  $btnClose.Location = New-Object System.Drawing.Point(155, 275)
  $btnClose.FlatStyle = "Flat"
  $btnClose.BackColor = [System.Drawing.Color]::FromArgb(40, 40, 60)
  $btnClose.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
  $btnClose.Font = New-Object System.Drawing.Font("Segoe UI", 10)
  $btnClose.Cursor = "Hand"
  $btnClose.Add_Click({ $form.Close() })
  $panel.Controls.Add($btnClose)

  return $panel
}

Show-Step "welcome"
$form.ShowDialog()
