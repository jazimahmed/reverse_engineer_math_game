# m5_release_sweep.ps1 - M5 offline differential sweep for the RELEASE build
# (org.independent.mathgames.research), run with Metro STOPPED so results
# prove the app works standalone. Writes png+xml into
# research/observations/runtime/ with the prefix "rel_".
#
# Usage:
#   . ".\tools\m5_release_sweep.ps1"; Start-Sweep

. (Join-Path $PSScriptRoot "rea-capture.ps1")

$script:RelPkg = "org.independent.mathgames.research"

function Start-RelApp {
    param([int]$SettleSec = 6)
    $null = Adb @("shell","am","force-stop",$RelPkg)
    Start-Sleep -Seconds 1
    $null = Adb @("shell","am","start","-n","$RelPkg/.MainActivity") | Out-Null
    Start-Sleep -Seconds $SettleSec
    $null = Clear-AnrDialog
}

function Rel-Snap {
    param([string]$Name)
    return (Snap -Name ("rel_" + $Name))
}

# Navigate from main menu: tap a topic tile, then a mode tile, then capture.
# Returns to the main menu afterwards (back-press x2), so each call is idempotent.
function Test-Mode {
    param([string]$Mode, [string]$Tag)
    Go-HomeSilent
    $menu = Rel-Snap "menu-$Tag"
    if (-not (Tap-Text -Nodes $menu -Text "Addition")) {
        Write-Host "[skip] Addition tile not found"
        return
    }
    Start-Sleep -Seconds 2
    $modes = Rel-Snap "modes-$Tag"
    if (-not (Tap-Text -Nodes $modes -Text $Mode)) {
        Write-Host "[skip] mode tile '$Mode' not found"
        Back-Main
        return
    }
    Start-Sleep -Seconds 3
    $null = Clear-AnrDialog
    $nodes = Rel-Snap ("mode-$Tag")
    # capture text nodes for the differential writeup
    $texts = $nodes | Where-Object { $_.Text -ne "" } | Select-Object -First 20
    Write-Section ("MODE {0} TEXTS" -f $Tag)
    Dump-Nodes -Nodes $texts
    Back-Main
}

# Press back until the main menu is visible (text 'Addition' present) or 6 taps.
function Back-Main {
    for ($i = 0; $i -lt 6; $i++) {
        $nodes = Get-UiNodes -Xml (Save-UiDump -Name "_nav")
        if (Find-Node -Nodes $nodes -Text "Addition") { return }
        Press-Back -SettleMs 700
    }
}

# Home button + relaunch app to main menu (relaunch lands on last screen;
# press back repeatedly if navigation state was preserved on a deeper screen).
function Go-HomeSilent {
    $null = Adb @("shell","input","keyevent","3")
    Start-Sleep -Milliseconds 800
    $null = Adb @("shell","am","start","-n","$RelPkg/.MainActivity") | Out-Null
    Start-Sleep -Seconds 2
}

function Start-Sweep {
    Write-Section "M5 release offline sweep"

    # 0. Confirm independence: Metro port must be closed before we launch.
    $port = netstat -an | findstr :8081
    if ($port -match "LISTENING") { Write-Warning "Metro still listening on 8081 - stop it for a true offline test" }
    else { Write-Host "[offline] Metro not listening - good" }

    # 1. First-launch capture (splash / initial render)
    $null = Adb @("shell","am","force-stop",$RelPkg)
    Start-Sleep -Seconds 1
    $null = Adb @("shell","am","start","-n","$RelPkg/.MainActivity") | Out-Null
    Start-Sleep -Seconds 2
    $null = Rel-Snap "launch-2s"
    Start-Sleep -Seconds 5
    $null = Clear-AnrDialog
    $menu = Rel-Snap "main-menu"

    # 2. Main menu sanity: topic + utility tiles present?
    $found = @("Addition","Subtract","Games","Settings") | ForEach-Object {
        "{0}={1}" -f $_, [bool](Find-Node -Nodes $menu -Text $_ -Contains:$true)
    }
    Write-Host ("[menu ] " + ($found -join " "))

    # 3. Addition topic-select
    if (Tap-Text -Nodes $menu -Text "Addition") {
        Start-Sleep -Seconds 2
        $null = Rel-Snap "add-modes"
    }

    # 4. Each observed Addition mode
    Test-Mode -Mode "Practice" -Tag "practice"
    Test-Mode -Mode "Quiz"     -Tag "quiz"
    Test-Mode -Mode "Duel"     -Tag "duel"
    Test-Mode -Mode "Test"     -Tag "test"
    Test-Mode -Mode "Time"     -Tag "time"
    Test-Mode -Mode "Play"     -Tag "play"
    Test-Mode -Mode "Learn"    -Tag "learn"

    # 5. Settings from main menu
    Back-Main
    $menu2 = Rel-Snap "main-menu-2"
    $gear = $menu2 | Where-Object { $_.Text -like "*⚙*" } | Select-Object -First 1
    if ($gear) { Tap-Node -Node $gear -SettleMs 1500 } else { Write-Host "[miss] gear" }
    Start-Sleep -Seconds 2
    $null = Rel-Snap "settings-dialog"
    Press-Back
    Write-Section "sweep complete"
}
