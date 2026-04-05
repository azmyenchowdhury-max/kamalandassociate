$root = (Get-Location).Path
$index = Get-Content -Path index.html -Raw

$navMatch = [regex]::Match($index, '<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark-custom"[\s\S]*?<\/nav>')
$footerMatch = [regex]::Match($index, '<footer class="footer-section">[\s\S]*?<\/footer>')
if (-not $navMatch.Success -or -not $footerMatch.Success) {
  throw 'Could not extract nav/footer from index.html'
}

$navBase = $navMatch.Value
$footerBase = $footerMatch.Value

$navBase = $navBase -replace 'class="nav-link active" href="index\.html"', 'class="nav-link" href="index.html"'
$navBase = $navBase -replace 'class="nav-link" href="blog\.html"', 'class="nav-link active" href="blog.html"'

function Convert-Links([string]$block, [string]$prefix) {
  [regex]::Replace($block, '(href|src)="(.*?)"', {
    param($m)
    $attr = $m.Groups[1].Value
    $val = $m.Groups[2].Value

    if ($val -match '^(https?:|#|tel:|mailto:|javascript:)') {
      return "$attr=`"$val`""
    }

    $newVal = "$prefix/$val"
    return "$attr=`"$newVal`""
  })
}

$targets = @()
$targets += Get-ChildItem -Path blog\author -File -Filter *.html
$targets += Get-ChildItem -Path blog\category -File -Filter *.html
$targets += Get-ChildItem -Path blog\archive -Recurse -File -Filter *.html

$updated = @()

foreach ($file in $targets) {
  $relativeDir = $file.Directory.FullName.Substring($root.Length).TrimStart('\\')
  if ([string]::IsNullOrWhiteSpace($relativeDir)) {
    $prefix = '.'
  } else {
    $depth = ($relativeDir -split '[\\/]' | Where-Object { $_ -ne '' }).Count
    $prefix = ((1..$depth | ForEach-Object { '..' }) -join '/')
  }

  $nav = Convert-Links $navBase $prefix
  $footer = Convert-Links $footerBase $prefix

  $content = Get-Content -Path $file.FullName -Raw
  $original = $content

  $content = [regex]::Replace($content, '<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark-custom"[\s\S]*?<\/nav>', $nav, 1)
  $content = [regex]::Replace($content, '<footer[^>]*>[\s\S]*?<\/footer>', $footer, 1)

  if ($content -ne $original) {
    Set-Content -Path $file.FullName -Value $content -NoNewline
    $updated += $file.FullName.Replace($root + '\\', '')
  }
}

Write-Output "Updated files: $($updated.Count)"
$updated | ForEach-Object { Write-Output $_ }
