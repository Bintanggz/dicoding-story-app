Add-Type -AssemblyName System.Drawing

# Load logo
$logo = [System.Drawing.Image]::FromFile('C:\xampp\htdocs\dicoding-story-app\public\icon-512.png')

# Create Wide (1280x720)
$wide = New-Object System.Drawing.Bitmap 1280, 720
$gWide = [System.Drawing.Graphics]::FromImage($wide)
# Dark background matching app theme (#0b0f19)
$gWide.Clear([System.Drawing.Color]::FromArgb(255, 11, 15, 25))
# Draw logo in center
$gWide.DrawImage($logo, (1280-512)/2, (720-512)/2, 512, 512)
$wide.Save('C:\xampp\htdocs\dicoding-story-app\public\screenshot-wide.png', [System.Drawing.Imaging.ImageFormat]::Png)
$gWide.Dispose()
$wide.Dispose()

# Create Narrow (720x1280)
$narrow = New-Object System.Drawing.Bitmap 720, 1280
$gNarrow = [System.Drawing.Graphics]::FromImage($narrow)
$gNarrow.Clear([System.Drawing.Color]::FromArgb(255, 11, 15, 25))
$gNarrow.DrawImage($logo, (720-512)/2, (1280-512)/2, 512, 512)
$narrow.Save('C:\xampp\htdocs\dicoding-story-app\public\screenshot-narrow.png', [System.Drawing.Imaging.ImageFormat]::Png)
$gNarrow.Dispose()
$narrow.Dispose()

$logo.Dispose()
