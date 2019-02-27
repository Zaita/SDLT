<%-- side wide alert message --%>
<% if $SiteConfig.NoScriptAlertMessage %>
<noscript>
  <div id="noscript-alert" class="d-print-none">
    <div class="alert-text">
      $SiteConfig.NoScriptAlertMessage
    </div>
  </div>
</noscript>
<% end_if %>
