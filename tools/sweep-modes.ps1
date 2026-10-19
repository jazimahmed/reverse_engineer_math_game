# sweep-modes.ps1 - M2 sweep: enter every mode of a topic, capture the entry
# screen and the activity it launches, then return to the mode-select.
#
#   powershell -File tools\sweep-modes.ps1 -Topic addition -Modes Practice,Quiz

param(
    [string]$Topic = "addition",
    [string]$Modes = "Practice,Quiz,Duel,Play,Test,Time,Learn,Hard",
    [string]$Prefix = "m2-mode"
)

$ErrorActionPreference = "Continue"
. "$PSScriptRoot\rea-capture.ps1"

$modeList = $Modes.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }

Write-Section "M2 SWEEP: modes of '$Topic' -> $($modeList -join ', ')"

foreach ($mode in $modeList) {
    Write-Host ""
    Write-Host "-- mode: $mode"

    if (-not (Ensure-Activity -Pattern "${Topic}Activity")) {
        Write-Host "  [warn] could not reach ${Topic}Activity (top=$(Get-TopActivity))"
        # try to get back to the main menu and re-enter the topic
        Ensure-Activity -Pattern "MainActivity" | Out-Null
        $nodes = Get-Nodes -Name "_mainmenu"
        if (-not (Tap-Id -Nodes $nodes -Id $Topic)) { continue }
        Start-Sleep -Milliseconds 1500
    }
    Clear-AnrDialog | Out-Null
    Start-Sleep -Milliseconds 300

    $sel = Get-Nodes -Name "_modesel"
    $label = Find-Node -Nodes $sel -Text $mode
    if (-not $label) {
        Write-Host "  [miss] mode label '$mode' not found on the mode-select screen"
        continue
    }
    Write-Host ("  [tap ] '{0}' at ({1},{2})" -f $mode, $label.CX, $label.CY)
    Tap-At -X $label.CX -Y $label.CY -SettleMs 1500
    Clear-AnrDialog | Out-Null

    # Some modes open a rules/difficulty dialog first; capture that too.
    $nodes = Get-Nodes -Name "_mode_entry"
    $top = Get-TopActivity
    Write-Host "  [top ] $top"

    $snap = Snap -Name "$Prefix-$($mode.ToLower())"
    Write-Host "  [nodes] $($snap.Count)"
    foreach ($n in ($snap | Where-Object { $_.Text -and $_.Text.Trim() -ne "" } | Sort-Object Y1, X1)) {
        Write-Host ("    '{0}' (id={1}, cls={2}) at ({3},{4}) {5}x{6}" -f $n.Text, $n.Id, $n.Class, $n.X1, $n.Y1, $n.W, $n.H)
    }

    # If a rules dialog is on top, try to dismiss it (any button) and capture
    # the screen underneath.
    $buttons = $snap | Where-Object { $_.Class -eq "android.widget.Button" -or $_.Class -eq "android.widget.ImageView" -and $_.Id -match "close|btn|ok" }
    if ($buttons) {
        Write-Host "  [dlg ] candidate dismiss controls: $(($buttons | ForEach-Object { $_.Id }) -join ', ')"
    }

    # Return to the mode-select.
    for ($i = 0; $i -lt 4; $i++) {
        if ((Get-TopActivity) -match "${Topic}Activity") { break }
        Press-Back -SettleMs 800
    }
    Write-Host "  [back] top=$(Get-TopActivity)"
}

Write-Host ""
Write-Section "MODE SWEEP DONE ($Topic)"
