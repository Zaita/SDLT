// @flow

import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import Questionnaire from "../Questionnaire/Questionnaire";
import HomeContainer from "../Home/HomeContainer";
import StartContainer from "../Questionnaire/StartContainer";

class App extends Component<*> {

  render() {
    return (
      <div>
        <main>
          <Switch>
            <Route exact path='/'>
              {() => {
                return <HomeContainer/>;
              }}
            </Route>
            <Route path='/questionnaire/start/:id'>
              {({match}) => {
                return <StartContainer questionnaireID={match.params.id}/>;
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
