// @flow

import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import Questionnaire from "../Questionnaire/Questionnaire";
import Home from "../Home/Home";

class App extends Component {

  render() {
    return (
        <div>
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
          <footer>
            <div>
              © 2019 | NZ Transport Agency
            </div>
          </footer>
        </div>

    );
  }
}

export default App;
