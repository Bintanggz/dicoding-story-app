Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\xampp\htdocs\dicoding-story-app\public\icon-192.png')
$bmp = New-Object System.Drawing.Bitmap 192, 192
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, 192, 192)
$bmp.Save('C:\xampp\htdocs\dicoding-story-app\public\icon-192-resized.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
$bmp.Dispose()
$g.Dispose()
Move-Item -Path 'C:\xampp\htdocs\dicoding-story-app\public\icon-192-resized.png' -Destination 'C:\xampp\htdocs\dicoding-story-app\public\icon-192.png' -Force

$img2 = [System.Drawing.Image]::FromFile('C:\xampp\htdocs\dicoding-story-app\public\icon-512.png')
$bmp2 = New-Object System.Drawing.Bitmap 512, 512
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.DrawImage($img2, 0, 0, 512, 512)
$bmp2.Save('C:\xampp\htdocs\dicoding-story-app\public\icon-512-resized.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img2.Dispose()
$bmp2.Dispose()
$g2.Dispose()
Move-Item -Path 'C:\xampp\htdocs\dicoding-story-app\public\icon-512-resized.png' -Destination 'C:\xampp\htdocs\dicoding-story-app\public\icon-512.png' -Force
