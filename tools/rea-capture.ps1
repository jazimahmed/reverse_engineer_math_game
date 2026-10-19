# rea-capture.ps1 - research capture toolkit for M2 runtime observation.
#
# Dot-source this file to get the helper functions, then use them from a
# sweep script. Every capture writes into research/observations/runtime/ so
# the evidence is committed next to the observations.
#
#   . "$PSScriptRoot\rea-capture.ps1"
#   Snap -Name "add-mode-select"
#   Tap-Text -Text "Practice"
#
# All functions are defensive: the emulator drops connections and the app
# occasionally shows a SystemUI ANR dialog that swallows taps.

Set-StrictMode -Version 2

$global:AdbPath    = "C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$global:RtDir      = Join-Path (Split-Path $PSScriptRoot -Parent) "research\observations\runtime"
$global:UiDir      = Join-Path $global:RtDir "ui"
$global:AppPackage = "com.GamesForKids.Mathgames.MultiplicationTables"
$global:ShotCount  = 0

function Ensure-Dirs {
    if (-not (Test-Path $global:RtDir)) { New-Item -ItemType Directory -Force $global:RtDir | Out-Null }
    if (-not (Test-Path $global:UiDir)) { New-Item -ItemType Directory -Force $global:UiDir | Out-Null }
}

function Adb {
    # NOTE: arguments are passed as a single array so that flags such as
    # "screencap -p" are not mistaken for PowerShell parameter names.
    param([Parameter(Mandatory = $true, Position = 0)][string[]]$A)
    $out = & $global:AdbPath @A 2>&1
    return ($out | Out-String).Trim()
}

function Wait-Device {
    param([int]$TimeoutSec = 60)
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        $d = Adb @("devices")
        if ($d -match "emulator-\d+\s+device") { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Get-TopActivity {
    $a = Adb @("shell","dumpsys","activity","activities")
    $m = [regex]::Match($a, "topResumedActivity=ActivityRecord\{\S+ u0\s+(\S+)")
    if ($m.Success) { return $m.Groups[1].Value }
    $m2 = [regex]::Match($a, "mResumedActivity: ActivityRecord\{\S+ u0\s+(\S+)")
    if ($m2.Success) { return $m2.Groups[1].Value }
    return "unknown"
}

function Get-CurrentPackage {
    $a = Adb @("shell","dumpsys","activity","activities")
    $m = [regex]::Match($a, "topResumedActivity=ActivityRecord\{\S+ u0\s+([A-Za-z0-9_.]+)/(\S+)")
    if ($m.Success) { return $m.Groups[1].Value }
    return "unknown"
}

# Returns a flat list of UI nodes parsed from a uiautomator dump.
function Get-UiNodes {
    param([string]$Xml)
    $nodes = @()
    foreach ($m in [regex]::Matches($Xml, '<node [^>]*?>')) {
        $v = $m.Value
        $b = [regex]::Match($v, 'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"')
        if (-not $b.Success) { continue }
        $x1 = [int]$b.Groups[1].Value; $y1 = [int]$b.Groups[2].Value
        $x2 = [int]$b.Groups[3].Value; $y2 = [int]$b.Groups[4].Value
        $nodes += [pscustomobject]@{
            Class   = [regex]::Match($v, 'class="([^"]*)"').Groups[1].Value
            Text    = [regex]::Match($v, 'text="([^"]*)"').Groups[1].Value
            Desc    = [regex]::Match($v, 'content-desc="([^"]*)"').Groups[1].Value
            Id      = ([regex]::Match($v, 'resource-id="([^"]*)"').Groups[1].Value -replace '.*/', '')
            Package = [regex]::Match($v, 'package="([^"]*)"').Groups[1].Value
            Clickable = [regex]::Match($v, 'clickable="([^"]*)"').Groups[1].Value
            Checked = [regex]::Match($v, 'checked="([^"]*)"').Groups[1].Value
            Selected = [regex]::Match($v, 'selected="([^"]*)"').Groups[1].Value
            Password = [regex]::Match($v, 'password="([^"]*)"').Groups[1].Value
            X1 = $x1; Y1 = $y1; X2 = $x2; Y2 = $y2
            W = $x2 - $x1; H = $y2 - $y1
            CX = [int](($x1 + $x2) / 2); CY = [int](($y1 + $y2) / 2)
        }
    }
    return $nodes
}

function Save-UiDump {
    param([Parameter(Mandatory = $true)][string]$Name)
    Ensure-Dirs
    $remote = "/sdcard/rea_$Name.xml"
    $null = Adb @("shell","uiautomator","dump",$remote)
    $local = Join-Path $global:UiDir "$Name.xml"
    $null = Adb @("pull",$remote,$local)
    $null = Adb @("shell","rm",$remote)
    if (Test-Path $local) { return (Get-Content $local -Raw -Encoding UTF8) }
    return ""
}

function Save-Screen {
    param([Parameter(Mandatory = $true)][string]$Name)
    Ensure-Dirs
    $remote = "/sdcard/rea_$Name.png"
    $null = Adb @("shell","screencap","-p",$remote)
    $local = Join-Path $global:RtDir "$Name.png"
    $null = Adb @("pull",$remote,$local)
    $null = Adb @("shell","rm",$remote)
    return $local
}

# Dump the UI hierarchy, write the screenshot, and return the parsed nodes.
function Snap {
    param([Parameter(Mandatory = $true)][string]$Name)
    $xml = Save-UiDump -Name $Name
    $png = Save-Screen -Name $Name
    Write-Host ("  [snap] {0,-38} xml={1,-7} png={2}" -f $Name, $xml.Length, (Test-Path $png))
    return (Get-UiNodes -Xml $xml)
}

function Tap-At {
    param([int]$X, [int]$Y, [int]$SettleMs = 900)
    $null = Adb @("shell","input","tap",$X,$Y)
    Start-Sleep -Milliseconds $SettleMs
}

function Tap-Node {
    param([Parameter(Mandatory = $true)]$Node, [int]$SettleMs = 900)
    Tap-At -X $Node.CX -Y $Node.CY -SettleMs $SettleMs
}

# Find a node whose text (or content-desc) matches exactly, else by prefix.
function Find-Node {
    param(
        [Parameter(Mandatory = $true)]$Nodes,
        [Parameter(Mandatory = $true)][string]$Text,
        [switch]$Contains,
        [switch]$Desc
    )
    $hit = $null
    if ($Desc) {
        $hit = $Nodes | Where-Object { $_.Desc -eq $Text } | Select-Object -First 1
        if (-not $hit -and $Contains) { $hit = $Nodes | Where-Object { $_.Desc -like "*$Text*" } | Select-Object -First 1 }
    } else {
        $hit = $Nodes | Where-Object { $_.Text -eq $Text } | Select-Object -First 1
        if (-not $hit -and $Contains) { $hit = $Nodes | Where-Object { $_.Text -like "*$Text*" } | Select-Object -First 1 }
    }
    return $hit
}

function Tap-Text {
    param(
        [Parameter(Mandatory = $true)]$Nodes,
        [Parameter(Mandatory = $true)][string]$Text,
        [switch]$Contains,
        [switch]$Desc,
        [int]$SettleMs = 900
    )
    $n = Find-Node -Nodes $Nodes -Text $Text -Contains:$Contains -Desc:$Desc
    if (-not $n) { Write-Host "  [miss] text='$Text'"; return $false }
    Write-Host ("  [tap ] '{0}' at ({1},{2})" -f $Text, $n.CX, $n.CY)
    Tap-At -X $n.CX -Y $n.CY -SettleMs $SettleMs
    return $true
}

function Press-Back {
    param([int]$SettleMs = 900)
    $null = Adb @("shell","input","keyevent","4")
    Start-Sleep -Milliseconds $SettleMs
}

# The swiftshader AVD intermittently raises a SystemUI "isn't responding"
# dialog that swallows taps. Detect and dismiss it with "Wait".
function Clear-AnrDialog {
    $xml = Save-UiDump -Name "_anr_check"
    if ($xml -match "isn.t responding") {
        $nodes = Get-UiNodes -Xml $xml
        $wait = Find-Node -Nodes $nodes -Text "Wait"
        if ($wait) {
            Write-Host "  [anr ] dismissing SystemUI ANR dialog via 'Wait'"
            Tap-Node -Node $wait -SettleMs 1200
            return $true
        }
    }
    return $false
}

function Go-Home {
    $null = Adb @("shell","input","keyevent","3")
    Start-Sleep -Milliseconds 700
}

# Force-stop and relaunch the app (used for persistence checks).
function Restart-App {
    $null = Adb @("shell","am","force-stop",$global:AppPackage)
    Start-Sleep -Seconds 1
    $null = Adb @("shell","am","start","-n","$($global:AppPackage)/.SplashScreenActivity") | Out-Null
    Start-Sleep -Seconds 3
}

function Start-App {
    $null = Adb @("shell","am","start","-n","$($global:AppPackage)/.SplashScreenActivity")
    Start-Sleep -Seconds 2
}

# Scroll the screen: swipe up (content moves up) or down.
function Scroll-Screen {
    param([ValidateSet("up", "down")][string]$Dir = "up", [int]$Amount = 700)
    $w = 540; $h = 1200
    if ($Dir -eq "up") {
        $null = Adb @("shell","input","swipe",$w,$h,$w,($h - $Amount),"300")
    } else {
        $null = Adb @("shell","input","swipe",$w,($h - $Amount),$w,$h,"300")
    }
    Start-Sleep -Milliseconds 800
}

function Find-NodeById {
    param(
        [Parameter(Mandatory = $true)]$Nodes,
        [Parameter(Mandatory = $true)][string]$Id
    )
    return ($Nodes | Where-Object { $_.Id -eq $Id } | Select-Object -First 1)
}

function Tap-Id {
    param(
        [Parameter(Mandatory = $true)]$Nodes,
        [Parameter(Mandatory = $true)][string]$Id,
        [int]$SettleMs = 1200
    )
    $n = Find-NodeById -Nodes $Nodes -Id $Id
    if (-not $n) { Write-Host "  [miss] id='$Id'"; return $false }
    Write-Host ("  [tap ] id='{0}' at ({1},{2})" -f $Id, $n.CX, $n.CY)
    Tap-At -X $n.CX -Y $n.CY -SettleMs $SettleMs
    return $true
}

# Bring the app back to a known activity by pressing back until the top
# activity matches, or until the main menu is reached.
function Ensure-Activity {
    param(
        [Parameter(Mandatory = $true)][string]$Pattern,
        [int]$MaxBack = 8
    )
    for ($i = 0; $i -lt $MaxBack; $i++) {
        $top = Get-TopActivity
        if ($top -match $Pattern) { return $true }
        Press-Back -SettleMs 700
    }
    return ((Get-TopActivity) -match $Pattern)
}

function Get-Nodes {
    param([string]$Name = "_scratch")
    return (Get-UiNodes -Xml (Save-UiDump -Name $Name))
}

function Dump-Nodes {
    param([Parameter(Mandatory = $true)]$Nodes)
    $Nodes |
        Sort-Object @{Expression = { $_.Y1 }}, @{Expression = { $_.X1 }} |
        ForEach-Object {
            "{0,5},{1,5}  {2,4}x{3,-4}  cls={4,-30} id={5,-14} text='{6}'" -f `
                $_.Y1, $_.X1, $_.W, $_.H, $_.Class, $_.Id, $_.Text
        }
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 78)
    Write-Host "  $Title"
    Write-Host ("=" * 78)
}
