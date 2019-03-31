import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import MainApp from "./components/App/MainApp";
import AnonymousApp from "./components/App/AnonymousApp";
import {HashRouter} from "react-router-dom";
import {Provider} from "react-redux";
import store from "./store/store";

window.addEventListener("load", () => {
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

  const anonymousContainer = document.getElementById("anonymous-app");
  if (anonymousContainer) {
    ReactDOM.render((<AnonymousApp/>), anonymousContainer);
  }
});


