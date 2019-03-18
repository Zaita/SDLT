// @flow

import React, {Component} from "react";
import type {Submission} from "../../types/Questionnaire";
import _ from "lodash";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import editIcon from "../../../img/icons/edit.svg";
import pdfIcon from "../../../img/icons/pdf.svg";
import URLUtil from "../../utils/URLUtil";
import PDFUtil from "../../utils/PDFUtil";
import AnswersPreview from "./AnswersPreview";

type Props = {
  siteTitle: string,
  submission: Submission | null,
};

class Review extends Component<Props> {

  render() {
    const {submission} = {...this.props};

    if (!submission) {
      return null;
    }

    if (submission.status !== "in_progress") {
      return (
        <div className="Review">
          <h3>
            The questionnaire is not in progress...
          </h3>
        </div>
      );
    }

    return (
      <div className="Review">
        <AnswersPreview submission={submission}/>
        <div className="buttons">
          <LightButton title="EDIT ANSWERS"
                       iconImage={editIcon}
                       classes={["button"]}
                       onClick={this.handleEditAnswerButtonClick.bind(this)}/>
          <LightButton title="DOWNLOAD PDF"
                       iconImage={pdfIcon}
                       classes={["button"]}
                       onClick={this.handlePDFDownloadButtonClick.bind(this)}/>
          <DarkButton title="SUBMIT QUESTIONNAIRE"
                      classes={["button"]}
                      onClick={this.handleSubmitButtonClick.bind(this)}/>
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
    const uuid = _.get(this.props, "submission.submissionUUID", "");
    if (!uuid) {
      return;
    }

    // TODO: Check if the questionnaire is answered properly (only have answered and non-applicable questions)

    // TODO: Network request

    URLUtil.redirectToQuestionnaireSummary(uuid);
  }
}

export default Review;
