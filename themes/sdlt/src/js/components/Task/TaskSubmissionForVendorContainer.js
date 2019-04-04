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
import {loadSiteTitle} from "../../actions/siteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    taskSubmission: state.taskSubmissionState.taskSubmission,
    siteTitle: state.siteConfigState.siteTitle,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    dispatchLoadDataAction() {
      const {uuid, secureToken} = {...props};
      dispatch(loadSiteTitle());
      dispatch(loadTaskSubmission({uuid, secureToken}));
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
  taskSubmission?: TaskSubmissionType | null,
  siteTitle?: string,
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
      siteTitle,
      taskSubmission,
      dispatchSaveAnsweredQuestionAction,
      dispatchMoveToPreviousQuestionAction,
      dispatchEditAnswersAction,
    } = {...this.props};

    if (!taskSubmission) {
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
          showBackButton={false}
        />
        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaskSubmissionForVendorContainer);
