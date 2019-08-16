// @flow

import React, {Component} from "react";
import type {Submission} from "../../types/Questionnaire";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import editIcon from "../../../img/icons/edit.svg";
import pdfIcon from "../../../img/icons/pdf.svg";
import AnswersPreview from "./AnswersPreview";
import SubmissionDataUtil from "../../utils/SubmissionDataUtil";
import URLUtil from "../../utils/URLUtil";

type Props = {
  siteTitle: string,
  submission: Submission | null,
  handleSubmitButtonClick: () => void,
  handlePDFDownloadButtonClick: () => void,
  handleEditAnswerButtonClick: () => void,
};

class Review extends Component<Props> {

  render() {
    const {
      submission,
      viewAs,
      handleSubmitButtonClick,
      handlePDFDownloadButtonClick,
      handleEditAnswerButtonClick,
    } = {...this.props};

    if (!submission) {
      return null;
    }

    const alreadySubmittedAlert = (
      <div className="alert alert-success text-center">
        This questionnaire has already been submitted.
      </div>
    )

    const buttons = (
      <div className="buttons">
      <LightButton title="EDIT ANSWERS"
                   iconImage={editIcon}
                   classes={["button"]}
                   onClick={handleEditAnswerButtonClick}/>
      <LightButton title="DOWNLOAD PDF"
                   iconImage={pdfIcon}
                   classes={["button"]}
                   onClick={handlePDFDownloadButtonClick}/>
      <DarkButton title="SUBMIT QUESTIONNAIRE"
                  classes={["button"]}
                  disabled={SubmissionDataUtil.existsUnansweredQuestion(submission.questions)}
                  onClick={handleSubmitButtonClick}/>
      </div>
    );

    const summaryButton = (
      <div className="buttons">
      <LightButton title="BACK TO SUMMARY"
                   classes={["button"]}
                   onClick={() => URLUtil.redirectToQuestionnaireSummary(submission.submissionUUID)}/>
      </div>
    );

    return (
      <div className="Review">
        {submission.status !== "in_progress" && alreadySubmittedAlert}
        <AnswersPreview questions={submission.questions}/>
        {(viewAs === 'submitter' && (submission.status === "in_progress" || submission.status === "submitted")) && buttons}
        {(viewAs !== 'submitter') && summaryButton}
      </div>
    );
  }
}

export default Review;
