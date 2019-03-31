// @flow

import React, {Component} from "react";
import {HashRouter, Route, Switch} from "react-router-dom";
import SummaryForBusinessOwnerContainer from "../Questionnaire/SummaryForBusinessOwner";
import {parse} from "query-string";

class AnonymousApp extends Component<*> {

  render() {

    return (
      <div>
        <main>
          <HashRouter>
            <Switch>
              <Route path='/questionnaire/summary/:uuid'>
                {({match, location}) => {
                  const query = parse(location.search);
                  return (
                    <div className="gray-bg">
                      <SummaryForBusinessOwnerContainer uuid={match.params.uuid} token={query.token || ""}/>
                    </div>
                  );
                }}
              </Route>
            </Switch>
          </HashRouter>
        </main>
      </div>

    );
  }
}

export default AnonymousApp;
