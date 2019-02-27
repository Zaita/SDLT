<%-- side wide alert message --%>
<% if $SiteConfig.AlertMessage && $SiteConfig.AlertEnabled %>
  <div id="site-alert" class="d-print-none">
    <div class="alert-text">$SiteConfig.AlertMessage</div>
    <button class="btn bg-transparent close-icon" aria-label="Close site alert">
      <i class="fa fa-times"></i>
    </button>
  </div>
<% end_if %>
