// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import {Route, Switch} from "react-router-dom";
import HomeContainer from "../Home/HomeContainer";
import StartContainer from "../Questionnaire/StartContainer";
import QuestionnaireContainer from "../Questionnaire/QuestionnaireContainer";
import ReviewContainer from "../Questionnaire/ReviewContainer";
import SummaryContainer from "../Questionnaire/SummaryContainer";
import TaskSubmissionContainer from "../Task/TaskSubmissionContainer";
import TaskStandaloneContainer from "../Task/TaskStandaloneContainer";
import ComponentSelectionStandaloneContainer from "../ComponentSelection/ComponentSelectionStandaloneContainer";
import ComponentSelectionContainer from "../ComponentSelection/ComponentSelectionContainer";
import MySubmissionList from "../QuestionnaireSubmissionList/MySubmissionList";
import AwaitingApprovalList from "../QuestionnaireSubmissionList/AwaitingApprovalList";
import MyProductList from "../QuestionnaireSubmissionList/MyProductList";
import SecurityRiskAssessmentContainer from "../SecurityRiskAssessment/SecurityRiskAssessmentContainer.js";
import ControlValidationAuditContainer from "../ControlValidationAudit/ControlValidationAuditContainer.js";
import {parse} from "query-string";
import { Loading } from "../Common/Loading.js";
import { withRouter } from 'react-router-dom';
import _ from "lodash";

const mapStateToProps = (state: RootState) => {
  return {
    loading: _.chain(state.loadingState).values().some(val => val).value()
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {};
};

type Props = {
  loading: boolean
};

class MainApp extends Component<*> {
  render() {
    return (
      <div>
        {this.props.loading && <Loading/>}
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
            {({match, location}) => {
              let secureToken = '';
              if (location.search) {
                const queryString = parse(location.search);
                secureToken = queryString.token;
              }
              return (
                <div className="gray-bg">
                    <ReviewContainer submissionHash={match.params.hash} secureToken={secureToken}/>
                  </div>
                );
              }}
            </Route>
            <Route path='/questionnaire/summary/:hash'>
              {({match, location}) => {
                let secureToken = '';
                if (location.search) {
                  const queryString = parse(location.search);
                  secureToken = queryString.token;
                }
                return (
                  <div className="gray-bg">
                    <SummaryContainer submissionHash={match.params.hash} secureToken={secureToken}/>
                  </div>
                );
              }}
            </Route>
            <Route path='/task/submission/:uuid'>
              {({match, location}) => {
                let secureToken = '';
                if (location.search) {
                  const queryString = parse(location.search);
                  secureToken = queryString.token;
                }
                return (
                  <div className="gray-bg">
                    <TaskSubmissionContainer uuid={match.params.uuid} secureToken={secureToken}/>
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
            <Route path='/component-selection/standalone/:taskId'>
              {({match, location}) => {
                let componentTarget = '';
                if (location.search) {
                  const queryString = parse(location.search);
                  componentTarget = queryString.componentTarget;
                }
                return (
                  <div className="gray-bg">
                    <ComponentSelectionStandaloneContainer
                    taskId={match.params.taskId}
                    componentTarget={componentTarget}
                    />
                  </div>
                );
              }}
            </Route>
            <Route path='/component-selection/submission/:uuid'>
              {({match, location}) => {
                let secureToken = '';
                if (location.search) {
                  const queryString = parse(location.search);
                  secureToken = queryString.token;
                }
                return (
                  <div className="gray-bg">
                    <ComponentSelectionContainer uuid={match.params.uuid} secureToken={secureToken}/>
                  </div>
                );
              }}
            </Route>

            <Route path='/control-validation-audit/submission/:uuid'>
              {({match, location}) => {
                let secureToken = '';
                if (location.search) {
                  const queryString = parse(location.search);
                  secureToken = queryString.token;
                }
                return (
                  <div className="gray-bg">
                    <ControlValidationAuditContainer uuid={match.params.uuid} secureToken={secureToken}/>
                  </div>
                );
              }}
            </Route>

            <Route path='/security-risk-assessment/submission/:uuid'>
              {({match, location}) => {
                let secureToken = '';
                if (location.search) {
                  const queryString = parse(location.search);
                  secureToken = queryString.token;
                }
                return (
                  <div className="gray-bg">
                    <SecurityRiskAssessmentContainer uuid={match.params.uuid} secureToken={secureToken}/>
                  </div>
                );
              }}
            </Route>

            <Route path='/MySubmissions'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <MySubmissionList/>
                  </div>
                );
              }}
            </Route>
            <Route path='/AwaitingApprovals'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <AwaitingApprovalList/>
                  </div>
                );
              }}
            </Route>
            <Route path='/MyProducts'>
              {({match}) => {
                return (
                  <div className="gray-bg">
                    <MyProductList/>
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
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(MainApp)
);
