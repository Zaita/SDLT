<!doctype html>
<html lang="en" class="security">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>$Title :: $SiteConfig.Title</title>
    <style type="text/css">
        .hero-image {
            background-image: url('$SiteConfig.LoginHeroImage.ScaleWidth(1920).getURL');
            background-image: linear-gradient(rgba(.3,.3,.3,.7), rgba(.9,.9,.9,0)), url('$SiteConfig.LoginHeroImage.ScaleWidth(1920).getURL');
        }
    </style>
  </head>
  <body class="$ClassName.ShortName security hero-image">
    <div class="h-100 container">

        <div class="row align-items-center">
            <div class="col login ">
            <img src="$SiteConfig.AuthLogo.URL" />
            <hr />
            $Form
            </div>
        </div>
    </div>
  </body>
</html>
