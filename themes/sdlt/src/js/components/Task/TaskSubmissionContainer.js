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
  approveTaskSubmission,
  denyTaskSubmission
} from "../../actions/task";
import TaskSubmission from "./TaskSubmission";
import type {User} from "../../types/User";
import type {TaskSubmission as TaskSubmissionType} from "../../types/Task";
import {loadCurrentUser} from "../../actions/user";
import {loadSiteTitle} from "../../actions/siteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    questionnaireSubmission: state.questionnaireState.submissionState,
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
    dispatchApproveTaskSubmissionAction(uuid: string) {
      dispatch(approveTaskSubmission(uuid));
    },
    dispatchDenyTaskSubmissionAction(uuid: string) {
      dispatch(denyTaskSubmission(uuid));
    }
  };
};

type Props = {
  uuid: string,
  taskSubmission?: TaskSubmissionType | null,
  siteTitle?: string,
  currentUser?: User | null,
  dispatchLoadDataAction?: (uuid: string) => void,
  dispatchApproveTaskSubmissionAction?: (uuid: string) => void,
  dispatchDenyTaskSubmissionAction?: (uuid: string) => void,
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
      dispatchApproveTaskSubmissionAction,
      dispatchDenyTaskSubmissionAction
    } = {...this.props};

    if (!currentUser || !taskSubmission) {
      return null;
    }

    // Decide what the permission of the current user
    let viewAs = "others";

    do {
      // Check if the current user is the submitter
      if (parseInt(currentUser.id) === parseInt(taskSubmission.submitter.id)) {
        viewAs = "submitter";
        break;
      }

      // Check if the current user is an approver
      if (taskSubmission.isCurrentUserAnApprover) {
        viewAs = "approver";
        break;
      }
    } while (false);

    // As logged-in user, only submitter and SA can edit answers
    const isCurrentUserSubmitter = parseInt(currentUser.id) === parseInt(taskSubmission.submitter.id);
    const canUpdateAnswers = (taskSubmission.status === "in_progress" || taskSubmission.status === "start" ) && (currentUser.isSA || isCurrentUserSubmitter);
    const showEditButton =
      (taskSubmission.status === "complete" || taskSubmission.status === "waiting_for_approval" ||taskSubmission.status === "denied") && (taskSubmission.questionnaireSubmissionStatus === "submitted")&&
      (currentUser.isSA || (isCurrentUserSubmitter && !taskSubmission.lockWhenComplete));

    return (
      <div className="TaskSubmissionContainer">
        <Header title={taskSubmission.taskName} subtitle={siteTitle} username={currentUser.name}/>
        <TaskSubmission
          taskSubmission={taskSubmission}
          saveAnsweredQuestion={dispatchSaveAnsweredQuestionAction}
          moveToPreviousQuestion={dispatchMoveToPreviousQuestionAction}
          editAnswers={dispatchEditAnswersAction}
          showEditButton={showEditButton}
          canUpdateAnswers={canUpdateAnswers}
          handleApproveButtonClick={this.handleApproveButtonClick.bind(this)}
          handleDenyButtonClick={this.handleDenyButtonClick.bind(this)}
          showBackButton={!!taskSubmission.questionnaireSubmissionUUID}
          viewAs={viewAs}
          siteTitle={siteTitle}
        />
        <Footer/>
      </div>
    );
  }

  handleApproveButtonClick() {
    const {user, isCurrentUserAnApprover, uuid} = {...this.props.taskSubmission};

    if (!user && !uuid && !isCurrentUserAnApprover) {
      return;
    }

    this.props.dispatchApproveTaskSubmissionAction(uuid);
  }

  handleDenyButtonClick() {
    const {user, isCurrentUserAnApprover, uuid} = {...this.props.taskSubmission};

    if (!user && !uuid && !isCurrentUserAnApprover) {
      return;
    }
    this.props.dispatchDenyTaskSubmissionAction(uuid);
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaskSubmissionContainer);
