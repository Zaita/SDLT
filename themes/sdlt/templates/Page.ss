<!DOCTYPE html>
<html lang="en">
<head>
  <% base_tag %>
  <title><% if $MetaTitle %>$MetaTitle<% else %>$Title<% end_if %> &raquo; $SiteConfig.Title</title>
  $MetaTags(false)
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no"
  />
  <% if $SiteConfig.FavIcon %>
    <link rel="shortcut icon" href="$SiteConfig.FavIcon.Link" />
  <% else %>
    <link rel="shortcut icon" href="favicon.ico" />
  <% end_if %>
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
</head>
<body>
  <% include SiteAlert %>
  <% include NoScriptAlert %>
  $Layout
</body>
</html>
