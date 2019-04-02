// @flow

import React, {Component} from "react";
import LogoImage from "../../../img/Logo.svg";
import Footer from "../Footer/Footer";
import type {Submission} from "../../types/Questionnaire";
import QuestionnaireForBusinessOwnerDataService from "../../services/QuestionnaireForBusinessOwnerDataService";
import Summary from "./Summary";
import PDFUtil from "../../utils/PDFUtil";
import CSRFTokenService from "../../services/CSRFTokenService";

type Props = {
  uuid: string,
  token: string
};

type State = {
  siteTitle: string,
  submission: Submission | null
};

class SummaryForBusinessOwnerContainer extends Component<Props, State> {

  constructor(props: *) {
    super(props);

    this.state = {
      siteTitle: "",
      submission: null,
    };
  }

  async componentDidMount() {
    await this.loadData();
  }

  render() {
    const {submission, siteTitle} = {...this.state};
    const {token} = {...this.props};

    let summary = null;
    if (submission) {
      // Business owner can only approve/deny under specific status
      let viewAs = (
        submission.approvalStatus.securityArchitect === "approved" &&
        submission.approvalStatus.businessOwner === "pending"
      ) ? "approver" : "others";

      summary = (
        <Summary submission={submission}
                 handlePDFDownloadButtonClick={() => { this.downloadPDF(submission, siteTitle);}}
                 handleApproveButtonClick={() => { this.approve(submission);}}
                 handleDenyButtonClick={() => { this.deny(submission);}}
                 viewAs={viewAs}
                 token={token}
        />
      );
    }

    return (
      <div className="SummaryContainer">
        <header className="Header">
          <div className="top-banner">
            <img src={LogoImage} className="logo"/>
          </div>
          <h1>SDLT</h1>
          <h2>Summary</h2>
        </header>
        {summary}
        <Footer/>
      </div>
    );
  }

  async downloadPDF(submission: Submission, siteTitle: string) {
    await PDFUtil.generatePDF({
      questions: submission.questions,
      submitter: submission.submitter,
      questionnaireTitle: submission.questionnaireTitle,
      siteTitle,
    });
  }

  async approve(submission: Submission) {
    await QuestionnaireForBusinessOwnerDataService.approveQuestionnaireSubmission({
      submissionID: submission.submissionID,
      csrfToken: await CSRFTokenService.getCSRFToken(),
      secureToken: this.props.token
    });
    await this.loadData();
  }

  async deny(submission: Submission) {
    await QuestionnaireForBusinessOwnerDataService.denyQuestionnaireSubmission({
      submissionID: submission.submissionID,
      csrfToken: await CSRFTokenService.getCSRFToken(),
      secureToken: this.props.token
    });
    await this.loadData();
  }

  async loadData() {
    const data = await QuestionnaireForBusinessOwnerDataService.fetchSubmissionData({
      uuid: this.props.uuid,
      secureToken: this.props.token,
    });

    this.setState({
      siteTitle: data.siteTitle,
      submission: data.submission,
    });
  }
}

export default SummaryForBusinessOwnerContainer;
