# sweep-topics.ps1 - M2 sweep: capture the mode-select screen of every
# main-menu topic and record the mode tiles each one exposes.
#
#   powershell -File tools\sweep-topics.ps1

$ErrorActionPreference = "Continue"
. "$PSScriptRoot\rea-capture.ps1"

$topics = @(
    @{ id = "addition";       name = "addition" }
    @{ id = "subtraction";    name = "subtraction" }
    @{ id = "multiplication"; name = "multiplication" }
    @{ id = "division";       name = "division" }
    @{ id = "square_root";    name = "square-root" }
    @{ id = "decimal";        name = "decimal" }
    @{ id = "fraction";       name = "fraction" }
)

Write-Section "M2 SWEEP: topic mode-select screens"

foreach ($t in $topics) {
    Write-Host ""
    Write-Host "-- topic: $($t.name)  (id=$($t.id))"

    if (-not (Ensure-Activity -Pattern "MainActivity")) {
        Write-Host "  [warn] could not reach MainActivity"
        continue
    }
    Clear-AnrDialog | Out-Null
    Start-Sleep -Milliseconds 400

    $nodes = Get-Nodes -Name "_mainmenu"
    if (-not (Tap-Id -Nodes $nodes -Id $t.id)) { continue }

    Start-Sleep -Milliseconds 1500
    Clear-AnrDialog | Out-Null
    $top = Get-TopActivity
    Write-Host "  [top ] $top"

    $modes = Snap -Name "m2-topic-$($t.name)"
    Write-Host "  [nodes] $($modes.Count)"

    # The mode tiles are images; the label is a separate TextView. Collect the
    # labels from the initial frame and from up to two scrolled frames so the
    # full mode list is recorded for every topic.
    $labels = New-Object System.Collections.ArrayList
    $scrolls = 0
    $frame = $modes
    while ($true) {
        foreach ($t2 in ($frame | Where-Object { $_.Text -and $_.Text.Trim() -ne "" -and $_.Class -eq "android.widget.TextView" } | Sort-Object Y1, X1)) {
            if (-not $labels.Contains($t2.Text)) { $null = $labels.Add($t2.Text) }
        }
        if ($scrolls -ge 2) { break }
        $before = $frame.Count
        Scroll-Screen -Dir "up" -Amount 600
        $frame = Snap -Name "m2-topic-$($t.name)-scroll$($scrolls + 1)"
        $scrolls++
        if ($frame.Count -eq $before) { break }
    }
    Write-Host "  [modes] $($labels -join ' | ')"

    # Also capture the header title text if present.
    $texts = $modes | Where-Object { $_.Text -and $_.Text.Trim() -ne "" } | Sort-Object Y1, X1
    foreach ($t2 in $texts) {
        Write-Host ("    text at ({0},{1}): '{2}'" -f $t2.X1, $t2.Y1, $t2.Text)
    }

    Press-Back -SettleMs 1200
}

Write-Host ""
Write-Section "TOPIC SWEEP DONE"
