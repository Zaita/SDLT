// @flow

import React, {Component} from "react";
import type {Submission} from "../../types/Questionnaire";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import editIcon from "../../../img/icons/edit.svg";
import pdfIcon from "../../../img/icons/pdf.svg";
import AnswersPreview from "./AnswersPreview";
import SubmissionDataUtil from "../../utils/SubmissionDataUtil";

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
      handleSubmitButtonClick,
      handlePDFDownloadButtonClick,
      handleEditAnswerButtonClick,
    } = {...this.props};

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
      </div>
    );
  }
}

export default Review;
