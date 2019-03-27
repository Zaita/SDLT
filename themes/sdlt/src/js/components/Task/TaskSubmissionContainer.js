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
  loadTaskSubmissionState,
  moveToPreviousQuestion,
  saveAnsweredQuestion,
} from "../../actions/task";
import type {TaskSubmissionState} from "../../store/TaskSubmissionState";
import TaskSubmission from "./TaskSubmission";

const mapStateToProps = (state: RootState) => {
  return {
    state: state.taskSubmissionState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadTaskSubmissionAction(uuid: string) {
      dispatch(loadTaskSubmissionState(uuid));
    },
    dispatchSaveAnsweredQuestionAction(answeredQuestion: Question) {
      dispatch(saveAnsweredQuestion(answeredQuestion));
    },
    dispatchMoveToPreviousQuestionAction(targetQuestion: Question) {
      dispatch(moveToPreviousQuestion(targetQuestion))
    },
    dispatchEditAnswersAction() {
      dispatch(editCompletedTaskSubmission())
    }
  };
};

type Props = {
  uuid: string,
  state?: TaskSubmissionState,
  dispatchLoadTaskSubmissionAction?: (uuid: string) => void,
  dispatchSaveAnsweredQuestionAction?: (answeredQuestion: Question) => void,
  dispatchMoveToPreviousQuestionAction?: (targetQuestion: Question) => void,
  dispatchEditAnswersAction?: () => void
};

class TaskSubmissionContainer extends Component<Props> {

  componentDidMount() {
    const {uuid, dispatchLoadTaskSubmissionAction} = {...this.props};
    dispatchLoadTaskSubmissionAction(uuid);
  }

  render() {
    const {dispatchSaveAnsweredQuestionAction, dispatchMoveToPreviousQuestionAction} = {...this.props};
    const {siteTitle, currentUser, taskSubmission} = {...this.props.state};

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
