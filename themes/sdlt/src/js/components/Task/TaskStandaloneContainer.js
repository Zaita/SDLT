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
  loadStandaloneTaskSubmission,
  moveToPreviousQuestionInTaskSubmission,
  saveAnsweredQuestionInTaskSubmission,
} from "../../actions/task";
import TaskSubmission from "./TaskSubmission";
import type {User} from "../../types/User";
import type {TaskSubmission as TaskSubmissionType} from "../../types/Task";
import {loadCurrentUser} from "../../actions/user";
import type {SiteConfig} from "../../types/SiteConfig";
import {loadSiteConfig} from "../../actions/siteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    taskSubmission: state.taskSubmissionState.taskSubmission,
    siteConfig: state.siteConfigState.siteConfig,
    currentUser: state.currentUserState.user,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    dispatchLoadDataAction() {
      const {taskId} = {...props};
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
      dispatch(loadStandaloneTaskSubmission({taskId}))
    },
    dispatchSaveAnsweredQuestionAction(answeredQuestion: Question) {
      dispatch(saveAnsweredQuestionInTaskSubmission({answeredQuestion, bypassNetwork: true}));
    },
    dispatchMoveToPreviousQuestionAction(targetQuestion: Question) {
      dispatch(moveToPreviousQuestionInTaskSubmission({targetQuestion, bypassNetwork: true}));
    },
    dispatchEditAnswersAction() {
      dispatch(editCompletedTaskSubmission({bypassNetwork: true}));
    },
  };
};

type OwnProps = {
  taskId: string
}

type ReduxProps = {
  taskSubmission?: TaskSubmissionType | null,
  siteConfig?: SiteConfig | null,
  currentUser?: User | null,
  dispatchLoadDataAction?: () => void,
  dispatchSaveAnsweredQuestionAction?: (answeredQuestion: Question) => void,
  dispatchMoveToPreviousQuestionAction?: (targetQuestion: Question) => void,
  dispatchEditAnswersAction?: () => void
}

type Props = OwnProps & ReduxProps;

class TaskStandaloneContainer extends Component<Props> {

  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      siteConfig,
      currentUser,
      taskSubmission,
      dispatchSaveAnsweredQuestionAction,
      dispatchMoveToPreviousQuestionAction,
      dispatchEditAnswersAction,
    } = {...this.props};

    if (!currentUser || !taskSubmission || !siteConfig) {
      return null;
    }

    const canUpdateAnswers = (taskSubmission.status === "in_progress" || taskSubmission.status === "start");
    const showEditButton = (taskSubmission.status === "complete");

    return (
      <div className="TaskSubmissionContainer">
        <Header title={taskSubmission.taskName} subtitle={siteConfig.siteTitle} username={currentUser.name} logopath={siteConfig.logoPath}/>
        <TaskSubmission
          taskSubmission={taskSubmission}
          saveAnsweredQuestion={dispatchSaveAnsweredQuestionAction}
          moveToPreviousQuestion={dispatchMoveToPreviousQuestionAction}
          editAnswers={dispatchEditAnswersAction}
          showEditButton={showEditButton}
          canUpdateAnswers={canUpdateAnswers}
          showBackButton={false}
          siteConfig={siteConfig}
          currentUser={currentUser}
        />
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaskStandaloneContainer);
