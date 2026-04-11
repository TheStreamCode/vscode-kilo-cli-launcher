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

$accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 246, 117))
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 0, 0, 0))
$font = New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, 110, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF(0, 72, 256, 120)

$graphics.TranslateTransform(2, 2)
$graphics.DrawString('K', $font, $shadowBrush, $rect, $format)
$graphics.ResetTransform()
$graphics.DrawString('K', $font, $accentBrush, $rect, $format)

$promptPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 229, 231, 235), 8)
$cursorPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 248, 246, 117), 8)
$graphics.DrawLine($promptPen, 84, 188, 164, 188)
$graphics.DrawLine($cursorPen, 170, 172, 170, 196)

$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$cursorPen.Dispose()
$promptPen.Dispose()
$shadowBrush.Dispose()
$accentBrush.Dispose()
$font.Dispose()
$dotBrush.Dispose()
$borderPen.Dispose()
$bgBrush.Dispose()
$outer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Generated $OutputPath"