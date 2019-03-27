// @flow

import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import HomeContainer from "../Home/HomeContainer";
import StartContainer from "../Questionnaire/StartContainer";
import QuestionnaireContainer from "../Questionnaire/QuestionnaireContainer";
import ReviewContainer from "../Questionnaire/ReviewContainer";
import SummaryContainer from "../Questionnaire/SummaryContainer";
import TaskSubmissionContainer from "../Task/TaskSubmissionContainer";

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
                return (
                  <div className="gray-bg">
                    <StartContainer questionnaireID={match.params.id}/>
                  </div>
                );
              }}
            </Route>
            <Route path='/questionnaire/submission/:hash'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <QuestionnaireContainer submissionHash={match.params.hash}/>
                  </div>
                );
              }}
            </Route>
            <Route path='/questionnaire/review/:hash'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <ReviewContainer submissionHash={match.params.hash}/>
                  </div>
                );
              }}
            </Route>
            <Route path='/questionnaire/summary/:hash'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <SummaryContainer submissionHash={match.params.hash}/>
                  </div>
                );
              }}
            </Route>
            <Route path='/task/submission/:uuid'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <TaskSubmissionContainer uuid={match.params.uuid}/>
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

export default App;
