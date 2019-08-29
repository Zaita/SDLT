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
  submissionHash: string,
  secureToken: string
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
    const {secureToken} = {...this.props};
    const {
      title,
      siteTitle,
      user,
      submission,
      isCurrentUserApprover,
      isCurrentUserABusinessOwnerApprover
    } = {...this.props.submissionState};

    if (!user) {
      return null;
    }

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

      // Check if the current user is an approver
      if (isCurrentUserABusinessOwnerApprover) {
        viewAs = "businessOwnerApprover";
        break;
      }
    } while (false);

    return (
      <div className="ReviewContainer">
        <Header title={title} subtitle="Review Responses" username={user.name}/>
        <Review siteTitle={siteTitle}
          viewAs={viewAs}
          submission={submission}
          secureToken={secureToken}
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
