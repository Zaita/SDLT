// @flow

import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import Questionnaire from "./components/Questionnaire/Questionnaire";
import Home from "./components/Home/Home";
import LogoImage from "../img/Logo.svg";

class App extends Component {

  render() {
    return (
        <div>
          <header>
            <div className="container py-3">
              <img className="logo" src={LogoImage}/>
            </div>
          </header>
          <main>
            <Switch>
              <Route exact path='/'>
                {() => {
                  return <Home/>;
                }}
              </Route>
              <Route path='/questionnaire/:questionnaire'>
                {({match}) => {
                  return <Questionnaire questionnaire={match.params.questionnaire}/>;
                }}
              </Route>
            </Switch>
          </main>
          <footer className="fixed-bottom">
            <div className="container pt-1">
              © 2019 | NZ Transport Agency
            </div>
          </footer>
        </div>

    );
  }
}

export default App;
