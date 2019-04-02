// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {QuestionnaireSubmissionState} from "../../store/QuestionnaireState";
import {
  approveQuestionnaireSubmission,
  denyQuestionnaireSubmission,
  editQuestionnaireSubmission,
  loadQuestionnaireSubmissionState,
  submitQuestionnaireForApproval,
} from "../../actions/questionnarie";
import Summary from "./Summary";
import PDFUtil from "../../utils/PDFUtil";

const mapStateToProps = (state: RootState) => {
  return {
    submissionState: state.questionnaireState.submissionState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadSubmissionAction(submissionHash: string) {
      dispatch(loadQuestionnaireSubmissionState(submissionHash));
    },
    dispatchSubmitForApprovalAction(submissionID: string) {
      dispatch(submitQuestionnaireForApproval(submissionID));
    },
    dispatchApproveSubmissionAction(submissionID: string) {
      dispatch(approveQuestionnaireSubmission(submissionID));
    },
    dispatchDenySubmissionAction(submissionID: string) {
      dispatch(denyQuestionnaireSubmission(submissionID));
    },
    dispatchEditSubmissionAction(submissionID: string) {
      dispatch(editQuestionnaireSubmission(submissionID));
    },
  };
};

type ownProps = {
  submissionHash: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  dispatchLoadSubmissionAction: (submissionHash: string) => void,
  dispatchSubmitForApprovalAction: (submissionID: string) => void,
  dispatchApproveSubmissionAction: (submissionID: string) => void,
  dispatchDenySubmissionAction: (submissionID: string) => void,
  dispatchEditSubmissionAction: (submissionID: string) => void,
};

type Props = ownProps & reduxProps;

class SummaryContainer extends Component<Props> {

  componentDidMount() {
    const {submissionHash, dispatchLoadSubmissionAction} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash);
  }

  render() {
    const {title, user, submission, isCurrentUserApprover} = {...this.props.submissionState};

    if (!user || !submission) {
      return null;
    }

    // Decide what the permission of the current user
    let viewAs = "others";

    do {
      // Check if the current user is the submitter
      if (user.id === submission.submitter.id) {
        viewAs = "submitter";
        break;
      }

      // Check if the current user is an approver
      if (isCurrentUserApprover) {
        viewAs = "approver";
        break;
      }
    } while (false);

    return (
      <div className="SummaryContainer">
        <Header title={title} subtitle="Summary"/>
        <Summary submission={submission}
                 handlePDFDownloadButtonClick={this.handlePDFDownloadButtonClick.bind(this)}
                 handleSubmitButtonClick={this.handleSubmitButtonClick.bind(this)}
                 handleApproveButtonClick={this.handleApproveButtonClick.bind(this)}
                 handleDenyButtonClick={this.handleDenyButtonClick.bind(this)}
                 handleEditButtonClick={this.handleEditButtonClick.bind(this)}
                 viewAs={viewAs}
        />
        <Footer/>
      </div>
    );
  }

  handlePDFDownloadButtonClick() {
    const {submission, siteTitle} = {...this.props.submissionState};
    if (!submission) {
      return;
    }

    PDFUtil.generatePDF({
      questions: submission.questions,
      submitter: submission.submitter,
      questionnaireTitle: submission.questionnaireTitle,
      siteTitle,
    });
  }

  handleSubmitButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchSubmitForApprovalAction(submission.submissionID);
  }

  handleApproveButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchApproveSubmissionAction(submission.submissionID);
  }

  handleDenyButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchDenySubmissionAction(submission.submissionID);
  }

  handleEditButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchEditSubmissionAction(submission.submissionID);
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummaryContainer);
