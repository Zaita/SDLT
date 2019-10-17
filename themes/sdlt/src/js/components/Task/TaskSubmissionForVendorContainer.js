// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {Question} from "../../types/Questionnaire";
import {
  editCompletedTaskSubmission,
  loadTaskSubmission,
  moveToPreviousQuestionInTaskSubmission,
  saveAnsweredQuestionInTaskSubmission,
} from "../../actions/task";
import TaskSubmission from "./TaskSubmission";
import type {TaskSubmission as TaskSubmissionType} from "../../types/Task";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    taskSubmission: state.taskSubmissionState.taskSubmission,
    siteConfig: state.siteConfigState.siteConfig,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    dispatchLoadDataAction() {
      const {uuid, secureToken} = {...props};
      dispatch(loadTaskSubmission({uuid, secureToken}));
      dispatch(loadSiteConfig());
    },
    dispatchSaveAnsweredQuestionAction(answeredQuestion: Question) {
      const {secureToken} = {...props};
      dispatch(saveAnsweredQuestionInTaskSubmission({answeredQuestion, secureToken}));
    },
    dispatchMoveToPreviousQuestionAction(targetQuestion: Question) {
      const {secureToken} = {...props};
      dispatch(moveToPreviousQuestionInTaskSubmission({targetQuestion, secureToken}));
    },
    dispatchEditAnswersAction() {
      const {secureToken} = {...props};
      dispatch(editCompletedTaskSubmission({secureToken}));
    },
  };
};

type OwnProps = {
  uuid: string,
  secureToken: string,
};

type ReduxProps = {
  siteConfig?: SiteConfig | null,
  taskSubmission?: TaskSubmissionType | null,
  dispatchLoadDataAction?: () => void,
  dispatchSaveAnsweredQuestionAction?: (answeredQuestion: Question) => void,
  dispatchMoveToPreviousQuestionAction?: (targetQuestion: Question) => void,
  dispatchEditAnswersAction?: () => void
};

type Props = OwnProps & ReduxProps;

class TaskSubmissionForVendorContainer extends Component<Props> {

  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      siteConfig,
      taskSubmission,
      dispatchSaveAnsweredQuestionAction,
      dispatchMoveToPreviousQuestionAction,
      dispatchEditAnswersAction,
    } = {...this.props};

    if (!taskSubmission || !siteConfig) {
      return null;
    }

    return (
      <div className="TaskSubmissionContainer">
        <Header title={taskSubmission.taskName} subtitle={siteConfig.siteTitle} showLogoutButton={false} logopath={siteConfig.logoPath}/>
        <TaskSubmission
          taskSubmission={taskSubmission}
          saveAnsweredQuestion={dispatchSaveAnsweredQuestionAction}
          moveToPreviousQuestion={dispatchMoveToPreviousQuestionAction}
          editAnswers={dispatchEditAnswersAction}
          showBackButton={false}
          showEditButton={false}
          canUpdateAnswers={taskSubmission.status === "in_progress"}
          siteTitle={siteConfig.siteTitle}
        />
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaskSubmissionForVendorContainer);
