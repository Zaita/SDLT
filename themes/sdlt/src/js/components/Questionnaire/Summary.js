// @flow

import React, {Component} from "react";
import type {Submission} from "../../types/Questionnaire";
import _ from "lodash";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import pdfIcon from "../../../img/icons/pdf.svg";
import URLUtil from "../../utils/URLUtil";
import PDFUtil from "../../utils/PDFUtil";
import AnswersPreview from "./AnswersPreview";

type Props = {
  siteTitle: string,
  submission: Submission | null,
};

class Summary extends Component<Props> {

  render() {
    const {submission} = {...this.props};

    if (!submission) {
      return null;
    }

    // TODO: Check questionnaire status
    /*
    if (submission.status === "in_progress") {
      return (
        <div className="Summary">
          <h3>
            Submission has not been complete
          </h3>
        </div>
      );
    }
    */

    // TODO: Check if all tasks are finished
    const disabledSendForApprovalButton = true;

    return (
      <div className="Summary">
        <AnswersPreview submission={submission}/>
        <div className="buttons">
          <LightButton title="DOWNLOAD PDF"
                       iconImage={pdfIcon}
                       classes={["button"]}
                       onClick={this.handlePDFDownloadButtonClick.bind(this)}/>
          <DarkButton title="SEND FOR APPROVAL"
                      classes={["button"]}
                      onClick={this.handleSubmitButtonClick.bind(this)}
                      disabled={disabledSendForApprovalButton}/>
        </div>
      </div>
    );
  }

  handleEditAnswerButtonClick() {
    const uuid = _.get(this.props, "submission.submissionUUID", "");
    if (!uuid) {
      return;
    }
    URLUtil.redirectToQuestionnaireEditing(uuid);
  }

  handlePDFDownloadButtonClick() {
    const {submission, siteTitle} = {...this.props};
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
    alert("Coming soon...");
  }
}

export default Summary;
