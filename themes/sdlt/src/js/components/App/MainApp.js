// @flow

import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import HomeContainer from "../Home/HomeContainer";
import StartContainer from "../Questionnaire/StartContainer";
import QuestionnaireContainer from "../Questionnaire/QuestionnaireContainer";
import ReviewContainer from "../Questionnaire/ReviewContainer";
import SummaryContainer from "../Questionnaire/SummaryContainer";
import TaskSubmissionContainer from "../Task/TaskSubmissionContainer";
import TaskStandaloneContainer from "../Task/TaskStandaloneContainer";

class MainApp extends Component<*> {

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
            <Route path='/tasks/standalone/:taskId'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <TaskStandaloneContainer taskId={match.params.taskId}/>
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

export default MainApp;
