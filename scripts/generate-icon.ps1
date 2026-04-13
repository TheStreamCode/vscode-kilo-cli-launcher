param(
    [string]$OutputPath = $(Join-Path (Split-Path -Parent $PSScriptRoot) 'media/icon.png')
)

Add-Type -AssemblyName System.Drawing

function New-RoundedRect {
    param(
        [int]$X,
        [int]$Y,
        [int]$Width,
        [int]$Height,
        [int]$Radius
    )

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $Radius * 2
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$mediaDir = Join-Path $repoRoot 'media'

if (!(Test-Path $mediaDir)) {
    New-Item -ItemType Directory -Path $mediaDir | Out-Null
}

$bitmap = New-Object System.Drawing.Bitmap 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(255, 15, 23, 42))

$outer = New-RoundedRect -X 16 -Y 16 -Width 224 -Height 224 -Radius 36
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 17, 24, 39))
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 51, 65, 85), 4)

$graphics.FillPath($bgBrush, $outer)
$graphics.DrawPath($borderPen, $outer)

$dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 71, 85, 105))
$graphics.FillEllipse($dotBrush, 56, 54, 14, 14)
$graphics.FillEllipse($dotBrush, 80, 54, 14, 14)
$graphics.FillEllipse($dotBrush, 104, 54, 14, 14)

$accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 248, 246, 117), 10)
$commandPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 229, 231, 235), 10)

$graphics.DrawLine($accentPen, 82, 102, 116, 128)
$graphics.DrawLine($accentPen, 82, 154, 116, 128)
$graphics.DrawLine($commandPen, 132, 128, 182, 128)
$graphics.DrawLine($accentPen, 192, 108, 192, 148)

$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$accentPen.Dispose()
$commandPen.Dispose()
$dotBrush.Dispose()
$borderPen.Dispose()
$bgBrush.Dispose()
$outer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Generated $OutputPath"
