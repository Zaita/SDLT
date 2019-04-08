import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import MainApp from "./components/App/MainApp";
import BusinessOwnerApp from "./components/App/BusinessOwnerApp";
import {HashRouter} from "react-router-dom";
import {Provider} from "react-redux";
import store from "./store/store";
import VendorApp from "./components/App/VendorApp";
import ReactModal from "react-modal";

window.addEventListener("load", () => {

  ReactModal.defaultStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      background: "#fff",
      overflow: "auto",
      WebkitOverflowScrolling: "touch",
      padding: "20px",
    },
  };

  const mainContainer = document.getElementById("main-app");
  if (mainContainer) {
    ReactDOM.render((
      <HashRouter>
        <Provider store={store}>
          <MainApp/>
        </Provider>
      </HashRouter>
    ), mainContainer);
  }

  const businessOwnerContainer = document.getElementById("business-owner-app");
  if (businessOwnerContainer) {
    ReactDOM.render((<BusinessOwnerApp/>), businessOwnerContainer);
  }

  const vendorContainer = document.getElementById("vendor-app");
  if (vendorContainer) {
    ReactDOM.render((
      <HashRouter>
        <Provider store={store}>
          <VendorApp/>
        </Provider>
      </HashRouter>
    ), vendorContainer);
  }
});


