// @flow

import type {Question, SubmissionQuestionData} from "../types/Questionnaire";

export default class SubmissionDataUtil {

  static transformFromFullQuestionToData(fullQuestion: Question): SubmissionQuestionData {
    const answerData: SubmissionQuestionData = {
      isCurrent: fullQuestion.isCurrent,
      hasAnswer: fullQuestion.hasAnswer,
      isApplicable: fullQuestion.isApplicable,
      answerType: fullQuestion.type
    };

    if (fullQuestion.type === "input" && Array.isArray(fullQuestion.inputs)) {
      answerData.inputs = fullQuestion.inputs.map((input) => {
        return {
          id: input.id,
          data: input.data
        };
      });
    }

    if(fullQuestion.type ==="action" && Array.isArray(fullQuestion.actions)) {
      answerData.actions = fullQuestion.actions.map((action) => {
        return {
          id: action.id,
          isChose: action.isChose
        };
      });
    }

    return answerData;
  }
}
