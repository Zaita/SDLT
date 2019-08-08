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

  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
</head>
<body data-class-name="$ClassName">
<div id="main-app">
  <div>
    <main>
      <div class="gray-bg">
        <div class="StartContainer">
          <header class="Header">
            <div class="top-banner">
              <a href="/">
                <img src="/resources/themes/sdlt/dist/img/../img/b002cf666ac7512c21ad21462efdf4e8.svg" class="logo">
              </a>
            </div>

            <h1>$Title</h1>

          </header>
          <div class="Start">
            <div class="start-form">
              <div class="info-box">
              $Form
              $Content
              </div>
            </div>
          </div>


          <footer class="Footer">
            <div>
            © $Now.Format('yyyy') | NZ Transport Agency
            </div>
          </footer>
        </div>
      </div>
    </main>
  </div>
</div>
</body>
</html>
