// @flow

import type {Question, SubmissionQuestionData} from "../types/Questionnaire";
import _ from "lodash";
import type {TaskSubmissionDisplay} from "../types/Task";

type CalculateCursorMoveFromQuestionArgument = {
  answeredQuestion: Question,
  questions: Array<Question>
};

type CalculateCursorMoveFromQuestionReturn = {
  currentIndex: number,
  targetIndex: number,
  nonApplicableIndexes: Array<number>,
  complete: boolean,
  terminate: boolean,
  result: string
};

export default class SubmissionDataUtil {

  static transformFromFullQuestionToData(fullQuestion: Question): SubmissionQuestionData {
    const answerData: SubmissionQuestionData = {
      isCurrent: fullQuestion.isCurrent,
      hasAnswer: fullQuestion.hasAnswer,
      isApplicable: fullQuestion.isApplicable,
      answerType: fullQuestion.type,
    };

    if (fullQuestion.type === "input" && Array.isArray(fullQuestion.inputs)) {
      answerData.inputs = fullQuestion.inputs.map((input) => {
        let data = input.data;
        if (data && _.isString(data)) {
          data = data.trim();
        }

        return {
          id: input.id,
          data: data,
        };
      });
    }

    if (fullQuestion.type === "action" && Array.isArray(fullQuestion.actions)) {
      answerData.actions = fullQuestion.actions.map((action) => {
        return {
          id: action.id,
          isChose: action.isChose,
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
      if (taskSubmission.status === "in_progress" || taskSubmission.status === "start" || taskSubmission.status=== "waiting_for_approval" || taskSubmission.status=== "denied") {
        exists = true;
      }
    });
    return exists;
  }

  static getDataUpdateIntent(
    argument: CalculateCursorMoveFromQuestionArgument,
  ): CalculateCursorMoveFromQuestionReturn {
    const {answeredQuestion, questions} = {...argument};

    const currentIndex = questions.findIndex((question) => question.id === answeredQuestion.id);
    const isLastQuestion = (currentIndex === questions.length - 1);

    const returnPackage = {
      currentIndex: currentIndex,
      nonApplicableIndexes: [],
      targetIndex: 0,
      complete: false,
      terminate: false,
      result: ""
    };

    // Process for input question
    if (answeredQuestion.type === "input") {
      if (isLastQuestion) {
        // Mark complete if this is the last question
        returnPackage.complete = true;
      } else {
        // Move to next question
        returnPackage.targetIndex = returnPackage.currentIndex + 1;
      }

      return returnPackage;
    }

    // If question is action type, move to the defined target
    if (answeredQuestion.type === "action") {
      if (!answeredQuestion.actions) {
        throw new Error("This question does not have any action!");
      }

      const choseAction = answeredQuestion.actions.find((action) => {
        return action.isChose;
      });
      if (!choseAction) {
        throw new Error("This question does not have any chosen action!");
      }

      // "continue" | "goto" | "message" | "finish"
      if (choseAction.type === "finish") {
        // Mark all questions later to be non-applicable
        for (let i = returnPackage.currentIndex + 1; i < questions.length; i++) {
          returnPackage.nonApplicableIndexes.push(i);
        }

        returnPackage.result = choseAction.result || "";
        returnPackage.complete = true;
      }

      if (choseAction.type === "message") {
        returnPackage.terminate = true;
      }

      if (choseAction.type === "continue" && !isLastQuestion) {
        returnPackage.targetIndex = returnPackage.currentIndex + 1;
      }

      if (choseAction.type === "goto") {
        // Go to another question, need to mark questions between current and target to be non-applicable
        const targetID = choseAction.goto;
        returnPackage.targetIndex = questions.findIndex((question) => {
          return question.id === targetID;
        });

        // Don't move if the target index is wrong
        if (returnPackage.targetIndex <= returnPackage.currentIndex) {
          throw new Error("The next question is not set correctly!");
        }

        // Find questions between target and current to be "not applicable"
        if (returnPackage.targetIndex - returnPackage.currentIndex > 1) {
          let cursor = returnPackage.currentIndex + 1;
          while (cursor < returnPackage.targetIndex) {
            returnPackage.nonApplicableIndexes.push(cursor);
            cursor++;
          }
        }
      }

      if (isLastQuestion) {
        // Mark complete if this is the last question
        returnPackage.complete = true;
      }

      return returnPackage;
    }

    throw new Error("Wrong question type!");
  }
}
