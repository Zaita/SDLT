// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {QuestionnaireSubmissionState} from "../../store/QuestionnaireState";
import {loadQuestionnaireSubmissionState, submitQuestionnaire} from "../../actions/questionnaire";
import Review from "./Review";
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
    dispatchSubmitQuestionnaire() {
      dispatch(submitQuestionnaire());
    },
  };
};

type ownProps = {
  submissionHash: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  dispatchLoadSubmissionAction: (submissionHash: string) => void,
  dispatchSubmitQuestionnaire: () => void,
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
        <Header title={title} subtitle="Review Responses" username={user.name}/>
        <Review siteTitle={siteTitle}
                submission={submission}
                handleSubmitButtonClick={this.handleSubmitButtonClick.bind(this)}
                handlePDFDownloadButtonClick={this.handlePDFDownloadButtonClick.bind(this)}
                handleEditAnswerButtonClick={this.handleEditAnswerButtonClick.bind(this)}/>
        <Footer/>
      </div>
    );
  }

  handleSubmitButtonClick() {
    this.props.dispatchSubmitQuestionnaire();
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
