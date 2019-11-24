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
  approveQuestionnaireSubmissionAsBusinessOwner,
  denyQuestionnaireSubmissionAsBusinessOwner,
  assignToSecurityArchitectQuestionnaireSubmission,
} from "../../actions/questionnaire";
import Summary from "./Summary";
import PDFUtil from "../../utils/PDFUtil";
import ReactModal from "react-modal";
import DarkButton from "../Button/DarkButton";
import LightButton from "../Button/LightButton";
import CSRFTokenService from "../../services/CSRFTokenService";
import RiskResultContainer from "../Common/RiskResultContainer";

const mapStateToProps = (state: RootState) => {
  return {
    submissionState: state.questionnaireState.submissionState,
    loadingState: state.loadingState
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    // load the Submission data on the summary screen
    dispatchLoadSubmissionAction(submissionHash: string, secureToken: string) {
      dispatch(loadQuestionnaireSubmissionState(submissionHash, secureToken));
    },

    // as a BO approve/ deny the submission
    dispatchBusinessOwnerApproveSubmissionAction(submissionID: string, secureToken: string) {
      dispatch(approveQuestionnaireSubmissionAsBusinessOwner(submissionID, secureToken));
    },
    dispatchBusinessOwnerDenySubmissionAction(submissionID: string, secureToken: string) {
      dispatch(denyQuestionnaireSubmissionAsBusinessOwner(submissionID, secureToken));
    },

    // user can edit answers and submit the questionnaire for approval
    dispatchSubmitForApprovalAction(submissionID: string) {
      dispatch(submitQuestionnaireForApproval(submissionID));
    },
    dispatchEditSubmissionAction(submissionID: string) {
      dispatch(editQuestionnaireSubmission(submissionID));
    },

    // as a SA and ciso approve/ deny the submission
    dispatchApproveSubmissionAction(submissionID: string, skipBoAndCisoApproval: boolean) {
      dispatch(approveQuestionnaireSubmission(submissionID, skipBoAndCisoApproval));
    },
    dispatchDenySubmissionAction(submissionID: string, skipBoAndCisoApproval: boolean) {
      dispatch(denyQuestionnaireSubmission(submissionID, skipBoAndCisoApproval));
    },

    // As a SA assign the submission to cureent logged in user
    dispatchAssignToMeAction(submissionID: string) {
      dispatch(assignToSecurityArchitectQuestionnaireSubmission(submissionID));
    },
  };
};

type ownProps = {
  submissionHash: string,
  secureToken: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  dispatchLoadSubmissionAction: (submissionHash: string, secureToken: string) => void,
  dispatchSubmitForApprovalAction: (submissionID: string) => void,
  dispatchApproveSubmissionAction: (submissionID: string) => void,
  dispatchDenySubmissionAction: (submissionID: string) => void,
  dispatchEditSubmissionAction: (submissionID: string) => void,
  approveQuestionnaireSubmissionFromBusinessOwner: (submissionID: string) => void,
  denyQuestionnaireSubmissionFromBusinessOwner: (submissionID: string) => void,
  loadingState: object<*>
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
    const {submissionHash, dispatchLoadSubmissionAction, secureToken} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash, secureToken);
  }

  render() {
    const {secureToken, loadingState} = {...this.props};
    const {
      location,
      title,
      user,
      submission,
      isCurrentUserApprover,
      isCurrentUserABusinessOwnerApprover,
      siteConfig
      } = {...this.props.submissionState};

    if (!user || !submission || !siteConfig) {
      return null;
    }

    if (loadingState['QUESTIONNAIRE/LOAD_QUESTIONNAIRE_SUBMISSION_STATE']) {
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

      // Check if the current user is an businessOwner approver
      if (isCurrentUserABusinessOwnerApprover) {
        viewAs = "businessOwnerApprover";
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
        <Header title={title} subtitle="Summary" username={user.name} logopath={siteConfig.logoPath}/>
        <Summary submission={submission}
                 handlePDFDownloadButtonClick={this.handlePDFDownloadButtonClick.bind(this)}
                 handleSubmitButtonClick={this.handleSubmitButtonClick.bind(this)}
                 handleApproveButtonClick={this.handleApproveButtonClick.bind(this)}
                 handleDenyButtonClick={this.handleDenyButtonClick.bind(this)}
                 handleEditButtonClick={this.handleOpenModal.bind(this)}
                 handleAssignToMeButtonClick={this.handleAssignToMeButtonClick.bind(this)}
                 viewAs={viewAs}
                 user={user}
                 token={secureToken}
        />
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
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
    const {submission, siteConfig} = {...this.props.submissionState};

    if (!submission || !siteConfig) {
      return;
    }

    let riskResults;
    if(submission && submission.riskResults) {
      riskResults = submission.riskResults;
    }

    PDFUtil.generatePDF({
      questions: submission.questions,
      submitter: submission.submitter,
      questionnaireTitle: submission.questionnaireTitle,
      siteConfig: siteConfig,
      riskResults: riskResults ? riskResults : [],
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
    const {secureToken} = {...this.props};
    const {
      user,
      submission,
      isCurrentUserApprover,
      isCurrentUserABusinessOwnerApprover
    } = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    if (isCurrentUserABusinessOwnerApprover) {
      this.props.dispatchBusinessOwnerApproveSubmissionAction(submission.submissionID, secureToken);
    } else if (isCurrentUserApprover) {
      this.props.dispatchApproveSubmissionAction(submission.submissionID, skipBoAndCisoApproval);
    }
  }

  handleDenyButtonClick(skipBoAndCisoApproval: boolean = false) {
    const {secureToken} = {...this.props};
    const {
      user,
      submission,
      isCurrentUserApprover,
      isCurrentUserABusinessOwnerApprover
    } = {...this.props.submissionState};

    if (!user || !submission) {
      return;
    }

    if (isCurrentUserABusinessOwnerApprover) {
      this.props.dispatchBusinessOwnerDenySubmissionAction(submission.submissionID, secureToken);
    } else if (isCurrentUserApprover) {
      this.props.dispatchDenySubmissionAction(submission.submissionID, skipBoAndCisoApproval);
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
