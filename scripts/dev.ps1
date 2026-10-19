# 简历工坊 · 启停脚本（由 start.bat / stop.bat 调用）
param(
  [ValidateSet('start', 'stop')]
  [string]$Action = 'start'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$port = 5183
$runDir = Join-Path $root '.run'
$pidFile = Join-Path $runDir 'dev.pid'
$logFile = Join-Path $runDir 'dev.log'

function Get-ListenPid {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($conn) { return [int]$conn.OwningProcess }
  return 0
}

function Test-Url([string]$url) {
  try {
    $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
    return ($res.StatusCode -eq 200)
  } catch {
    return $false
  }
}

function Stop-Tree([int]$processId) {
  if ($processId -le 0) { return $false }
  # taskkill 找不到进程时会往 stderr 写内容，这里必须降级错误级别并吞掉输出
  $ErrorActionPreference = 'Continue'
  $null = & taskkill.exe /PID $processId /T /F 2>&1
  return ($LASTEXITCODE -eq 0)
}

if ($Action -eq 'stop') {
  $killed = $false

  if (Test-Path $pidFile) {
    $saved = (Get-Content $pidFile -Raw).Trim()
    if ($saved -match '^\d+$') {
      if (Stop-Tree ([int]$saved)) {
        Write-Host "[完成] 已结束进程树 $saved"
        $killed = $true
      }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }

  $listenPid = Get-ListenPid
  if ($listenPid -gt 0) {
    if (Stop-Tree $listenPid) {
      Write-Host "[完成] 已释放端口 $port（PID $listenPid）"
      $killed = $true
    }
  }

  if ($killed) {
    Write-Host ''
    Write-Host '服务已关闭。'
  } else {
    Write-Host '[信息] 没有检测到正在运行的服务，无需关闭。'
  }
  exit 0
}

Write-Host '简历工坊 · 启动器' -ForegroundColor Cyan
Write-Host ''

if (-not (Test-Path $runDir)) { New-Item -ItemType Directory -Path $runDir | Out-Null }

$listenPid = Get-ListenPid
if ($listenPid -gt 0) {
  Write-Host "[信息] 服务已在运行（PID $listenPid），直接打开页面。"
  if ($env:NO_BROWSER -ne '1') { Start-Process "http://localhost:$port/" }
  exit 0
}

$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Host '[错误] 没有找到 npm，请先安装 Node.js 18 或以上版本：https://nodejs.org/' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path (Join-Path $root 'node_modules'))) {
  Write-Host '[1/2] 首次启动，正在安装依赖，可能需要 1-3 分钟...'
  $ErrorActionPreference = 'Continue'
  & npm.cmd install
  $ErrorActionPreference = 'Stop'
  if ($LASTEXITCODE -ne 0) {
    Write-Host '[错误] 依赖安装失败，请检查网络后重试。' -ForegroundColor Red
    exit 1
  }
}

Write-Host '[2/2] 启动本地服务...'

$proc = Start-Process -FilePath 'cmd.exe' `
  -ArgumentList '/c', "npm run dev > `"$logFile`" 2>&1" `
  -WorkingDirectory $root `
  -PassThru -WindowStyle Hidden

$proc.Id | Out-File -FilePath $pidFile -Encoding ascii -NoNewline

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  if (Test-Url "http://localhost:$port/") { $ready = $true; break }
  if ($proc.HasExited) { break }
  Start-Sleep -Milliseconds 500
}

if (-not $ready) {
  Write-Host '[错误] 服务没有在 30 秒内就绪。' -ForegroundColor Red
  Write-Host "  日志：$logFile"
  if (Test-Path $logFile) {
    Write-Host '--- 日志末 20 行 ---'
    Get-Content $logFile -Tail 20
  }
  exit 1
}

if ($env:NO_BROWSER -ne '1') { Start-Process "http://localhost:$port/" }

Write-Host ''
Write-Host "已启动：http://localhost:$port/" -ForegroundColor Green
Write-Host '关闭时双击 stop.bat；本窗口可以直接关掉，不影响服务。'
exit 0
