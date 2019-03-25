// @flow

import type {Question, SubmissionQuestionData} from "../types/Questionnaire";
import _ from "lodash";
import type {TaskSubmissionDisplay} from "../types/Task";

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
        let data = input.data;
        if (data && _.isString(data)) {
          data = data.trim();
        }

        return {
          id: input.id,
          data: data
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

  static existsUnansweredQuestion(questions: Array<Question>): boolean {
    let hasUnansweredQuestion = false;
    questions.forEach((question) => {
      const {hasAnswer, isApplicable} = {...question};
      // Invalid question state: does not have answer and still available
      if (!hasAnswer && isApplicable) {
        hasUnansweredQuestion = true;
      }
    });
    return hasUnansweredQuestion;
  }

  static existsIncompleteTaskSubmission(taskSubmissions: Array<TaskSubmissionDisplay>): boolean {
    let exists = false;
    taskSubmissions.forEach((taskSubmission) => {
      if (taskSubmission.status === "in_progress") {
        exists = true;
      }
    });
    return exists;
  }
}
