// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {QuestionnaireSubmissionState} from "../../store/QuestionnaireState";
import {loadQuestionnaireSubmissionState, submitQuestionnaire} from "../../actions/questionnarie";
import Review from "./Review";
import SubmissionDataUtil from "../../utils/SubmissionDataUtil";
import PDFUtil from "../../utils/PDFUtil";
import _ from "lodash";
import URLUtil from "../../utils/URLUtil";

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
    dispatchSubmitQuestionnaire(submissionID: string) {
      dispatch(submitQuestionnaire(submissionID));
    },
  };
};

type ownProps = {
  submissionHash: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  dispatchLoadSubmissionAction: (submissionHash: string) => void,
  dispatchSubmitQuestionnaire: (submissionID: string) => void,
};

type Props = ownProps & reduxProps;

class ReviewContainer extends Component<Props> {

  componentDidMount() {
    const {submissionHash, dispatchLoadSubmissionAction} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash);
  }

  render() {
    const {title, siteTitle, user, submission} = {...this.props.submissionState};

    if (!user) {
      return null;
    }

    return (
      <div className="ReviewContainer">
        <Header title={title} subtitle="Review Responses"/>
        <Review siteTitle={siteTitle}
                submission={submission}
                handleSubmitButtonClick={this.handleSubmitButtonClick.bind(this)}
                handlePDFDownloadButtonClick={this.handlePDFDownloadButtonClick.bind(this)}
                handleEditAnswerButtonClick={this.handleEditAnswerButtonClick.bind(this)}/>
        <Footer/>;
      </div>
    )
      ;
  }

  handleSubmitButtonClick() {
    const submission = this.props.submissionState.submission;
    if (!submission) {
      return;
    }

    // Check if the questionnaire is answered properly (only have answered and non-applicable questions)
    if (SubmissionDataUtil.existsUnansweredQuestion(submission.questions)) {
      alert("There are questions not answered properly, please check your answers");
      return;
    }

    this.props.dispatchSubmitQuestionnaire(submission.submissionID);
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

  handleEditAnswerButtonClick() {
    const uuid = _.get(this.props.submissionState, "submission.submissionUUID", "");
    if (!uuid) {
      return;
    }
    URLUtil.redirectToQuestionnaireEditing(uuid);
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReviewContainer);
