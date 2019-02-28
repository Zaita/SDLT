class SiteAlert {
  constructor() {

  }

  static init() {
    window.addEventListener("load", (event) => {
      const siteAlertClosed = sessionStorage.getItem("SiteAlertClosed");
      const siteAlertElement = document.querySelector("#site-alert");
      const bodyElement = document.querySelector("body");

      if (siteAlertClosed !== "true") {
        siteAlertElement.style.display = "flex";
        bodyElement.style.paddingTop = siteAlertElement.offsetHeight+"px";
      }

      //$("#site-alert .close-icon").on("click", () => {
      document.querySelector("#site-alert .close-icon").on("click", () => {
        sessionStorage.setItem("SiteAlertClosed", "true");
        siteAlertElement.style.display = "none";
        bodyElement.style.paddingTop = 0;
      });
    });
  }
}

export default SiteAlert;
