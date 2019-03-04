import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import {HashRouter} from "react-router-dom";
import {Provider} from "react-redux";
import store from "./store/store";

ReactDOM.render((
  <HashRouter>
    <Provider store={store}>
      <App/>
    </Provider>
  </HashRouter>
), document.getElementById("main-app"));
