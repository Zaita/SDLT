// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {QuestionnaireSubmissionState} from "../../store/QuestionnaireState";
import {loadQuestionnaireSubmissionState, submitQuestionnaireForApproval} from "../../actions/questionnarie";
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
    dispatchSubmitForApproval(submissionID: string) {
      dispatch(submitQuestionnaireForApproval(submissionID));
    }
  };
};

type ownProps = {
  submissionHash: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  dispatchLoadSubmissionAction: (submissionHash: string) => void,
  dispatchSubmitForApproval: (submissionID: string) => void,
};

type Props = ownProps & reduxProps;

class SummaryContainer extends Component<Props> {

  componentDidMount() {
    const {submissionHash, dispatchLoadSubmissionAction} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash);
  }

  render() {
    const {title, user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return null;
    }

    // Decide what the permission of the current user
    let viewAs = "others";
    // Check if the current user is the submitter
    if (user.id === submission.submitter.id) {
      viewAs = "submitter";
    }
    // Check if the current user is an approver
    if (user.role === "Approver") {
      viewAs = "approver";
    }

    return (
      <div className="SummaryContainer">
        <Header title={title} subtitle="Summary"/>
        <Summary submission={submission}
                 handlePDFDownloadButtonClick={this.handlePDFDownloadButtonClick.bind(this)}
                 handleSubmitButtonClick={this.handleSubmitButtonClick.bind(this)}
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

    this.props.dispatchSubmitForApproval(submission.submissionID);
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummaryContainer);
