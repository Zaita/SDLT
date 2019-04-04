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
import type {User} from "../../types/User";
import type {TaskSubmission as TaskSubmissionType} from "../../types/Task";
import {loadCurrentUser} from "../../actions/user";
import {loadSiteTitle} from "../../actions/siteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    taskSubmission: state.taskSubmissionState.taskSubmission,
    siteTitle: state.siteConfigState.siteTitle,
    currentUser: state.currentUserState.user,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction(uuid: string) {
      dispatch(loadCurrentUser());
      dispatch(loadSiteTitle());
      dispatch(loadTaskSubmission({uuid}));
    },
    dispatchSaveAnsweredQuestionAction(answeredQuestion: Question) {
      dispatch(saveAnsweredQuestionInTaskSubmission({answeredQuestion}));
    },
    dispatchMoveToPreviousQuestionAction(targetQuestion: Question) {
      dispatch(moveToPreviousQuestionInTaskSubmission({targetQuestion}));
    },
    dispatchEditAnswersAction() {
      dispatch(editCompletedTaskSubmission());
    },
  };
};

type Props = {
  uuid: string,
  taskSubmission?: TaskSubmissionType | null,
  siteTitle?: string,
  currentUser?: User | null,
  dispatchLoadDataAction?: (uuid: string) => void,
  dispatchSaveAnsweredQuestionAction?: (answeredQuestion: Question) => void,
  dispatchMoveToPreviousQuestionAction?: (targetQuestion: Question) => void,
  dispatchEditAnswersAction?: () => void
};

class TaskSubmissionContainer extends Component<Props> {

  componentDidMount() {
    const {uuid, dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction(uuid);
  }

  render() {
    const {
      siteTitle,
      currentUser,
      taskSubmission,
      dispatchSaveAnsweredQuestionAction,
      dispatchMoveToPreviousQuestionAction,
      dispatchEditAnswersAction,
    } = {...this.props};

    if (!currentUser || !taskSubmission) {
      return null;
    }

    return (
      <div className="TaskSubmissionContainer">
        <Header title={taskSubmission.taskName} subtitle={siteTitle}/>
        <TaskSubmission
          taskSubmission={taskSubmission}
          saveAnsweredQuestion={dispatchSaveAnsweredQuestionAction}
          moveToPreviousQuestion={dispatchMoveToPreviousQuestionAction}
          editAnswers={dispatchEditAnswersAction}
        />
        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaskSubmissionContainer);
