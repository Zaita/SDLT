// @flow

import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import {parse} from "query-string";
import TaskSubmissionForVendorContainer from "../Task/TaskSubmissionForVendorContainer";

class VendorApp extends Component<*> {

  render() {
    return (
      <div>
        <main>
          <Switch>
            <Route path='/task/submission/:uuid'>
              {({match, location}) => {
                const query = parse(location.search);
                return (
                  <div className="gray-bg">
                    <TaskSubmissionForVendorContainer uuid={match.params.uuid} secureToken={query.token || ""}/>
                  </div>
                );
              }}
            </Route>
          </Switch>
        </main>
      </div>

    );
  }
}

export default VendorApp;
