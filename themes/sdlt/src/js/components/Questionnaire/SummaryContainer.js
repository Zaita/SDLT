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
  approveQuestionnaireSubmissionFromBusinessOwner,
  denyQuestionnaireSubmissionFromBusinessOwner,
  assignToSecurityArchitectQuestionnaireSubmission,
} from "../../actions/questionnaire";
import Summary from "./Summary";
import PDFUtil from "../../utils/PDFUtil";
import ReactModal from "react-modal";
import DarkButton from "../Button/DarkButton";
import LightButton from "../Button/LightButton";
import CSRFTokenService from "../../services/CSRFTokenService";

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
    dispatchBusinessOwnerApproveSubmissionAction(submissionID: string) {
      dispatch(approveQuestionnaireSubmissionFromBusinessOwner(submissionID));
    },
    dispatchBusinessOwnerDenySubmissionAction(submissionID: string) {
      dispatch(denyQuestionnaireSubmissionFromBusinessOwner(submissionID));
    },
    dispatchApproveSubmissionAction(submissionID: string, skipBoAndCisoApproval: boolean) {
      dispatch(approveQuestionnaireSubmission(submissionID, skipBoAndCisoApproval));
    },
    dispatchDenySubmissionAction(submissionID: string, skipBoAndCisoApproval: boolean) {
      dispatch(denyQuestionnaireSubmission(submissionID, skipBoAndCisoApproval));
    },
    dispatchEditSubmissionAction(submissionID: string) {
      dispatch(editQuestionnaireSubmission(submissionID));
    },
    dispatchAssignToMeAction(submissionID: string) {
      dispatch(assignToSecurityArchitectQuestionnaireSubmission(submissionID));
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
  approveQuestionnaireSubmissionFromBusinessOwner: (submissionID: string) => void,
  denyQuestionnaireSubmissionFromBusinessOwner: (submissionID: string) => void,
};

type Props = ownProps & reduxProps;

type State = {
  showModal: boolean
};

class SummaryContainer extends Component<Props, State> {

  constructor() {
    super();
    this.state = {
      showModal: false,
    };
  }

  componentDidMount() {
    const {submissionHash, dispatchLoadSubmissionAction} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash);
  }

  render() {
    const {title, user, submission, isCurrentUserApprover, isCurrentUserABusinessOwnerApprover} = {...this.props.submissionState};

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

      // Check if the current user is an approver
      if (isCurrentUserABusinessOwnerApprover) {
        viewAs = "businessOwnerApprover";
        break;
      }
    } while (false);

    return (
      <div className="SummaryContainer">
        <Header title={title} subtitle="Summary" username={user.name}/>
        <Summary submission={submission}
                 handlePDFDownloadButtonClick={this.handlePDFDownloadButtonClick.bind(this)}
                 handleSubmitButtonClick={this.handleSubmitButtonClick.bind(this)}
                 handleApproveButtonClick={this.handleApproveButtonClick.bind(this)}
                 handleDenyButtonClick={this.handleDenyButtonClick.bind(this)}
                 handleEditButtonClick={this.handleOpenModal.bind(this)}
                 handleAssignToMeButtonClick={this.handleAssignToMeButtonClick.bind(this)}
                 viewAs={viewAs}
                 user={user}
        />
        <Footer/>
        <ReactModal
          isOpen={this.state.showModal}
          parentSelector={() => {return document.querySelector(".SummaryContainer");}}
        >
          <h3>
            Are you sure you want to edit this submission?
          </h3>
          <div className="content">
            This will cancel your current submission and require it to be resubmitted for approval.
          </div>
          <div>
            <DarkButton title="Yes" onClick={this.handleEditButtonClick.bind(this)}/>
            <LightButton title="No" onClick={this.handleCloseModal.bind(this)}/>
          </div>
        </ReactModal>
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

  handleApproveButtonClick(skipBoAndCisoApproval: boolean = false) {
    const {user, submission, isCurrentUserApprover, isCurrentUserABusinessOwnerApprover} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    if (isCurrentUserApprover) {
      this.props.dispatchApproveSubmissionAction(submission.submissionID, skipBoAndCisoApproval);
    }

    if (isCurrentUserABusinessOwnerApprover) {
      this.props.dispatchBusinessOwnerApproveSubmissionAction(submission.submissionID);
    }
  }

  handleDenyButtonClick(skipBoAndCisoApproval: boolean = false) {
    const {user, submission, isCurrentUserApprover, isCurrentUserABusinessOwnerApprover} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    if (isCurrentUserApprover) {
      this.props.dispatchDenySubmissionAction(submission.submissionID, skipBoAndCisoApproval);
    }

    if (isCurrentUserABusinessOwnerApprover) {
      this.props.dispatchBusinessOwnerDenySubmissionAction(submission.submissionID);
    }
  }

  handleAssignToMeButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.props.dispatchAssignToMeAction(submission.submissionID);
  }


  handleEditButtonClick() {
    const {user, submission} = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    this.handleCloseModal();
    this.props.dispatchEditSubmissionAction(submission.submissionID);
  }

  handleOpenModal() {
    this.setState({showModal: true});
  }

  handleCloseModal() {
    this.setState({showModal: false});
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummaryContainer);
