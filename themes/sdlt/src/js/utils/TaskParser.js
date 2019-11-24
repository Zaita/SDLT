// @flow

import toString from "lodash/toString";
import get from "lodash/get";
import type {Task} from "../types/Task";
import QuestionParser from "./QuestionParser";
import type {LikelihoodThreshold} from "../types/Task";
import toArray from "lodash/toArray";

export default class TaskParser {

  static parseFromJSONObject(jsonObject: *): Task {
    const id = toString(get(jsonObject, "ID", ""));
    const name = toString(get(jsonObject, "Name", ""));
    const componentTarget = toString(get(jsonObject, "ComponentTarget", ""));
    let type = toString(get(jsonObject, "TaskType", ""));
    switch (type) {
      case "questionnaire":
      case "selection":
        break;
      default:
        type = "questionnaire";
    }

    let questions = [];
    const schemaJSON = toString(get(jsonObject, "QuestionsDataJSON", ""));
    if (schemaJSON) {
      questions = QuestionParser.parseQuestionsFromJSON({
        schemaJSON,
        answersJSON: "{}"
      });
    }

    return {id, name, type, componentTarget, questions};
  }

  static parseLikelihoodJSONObject(likelihoodJSON: string | Object): LikelihoodThreshold {
    const jsonArray = (typeof likelihoodJSON === "string" ? JSON.parse(likelihoodJSON) : likelihoodJSON);

    if (jsonArray) {
      return toArray(jsonArray).map((jsonObject) => {
        return {
          name: toString(get(jsonObject, "Name")),
          value: toString(get(jsonObject, "Value")),
          operator: toString(get(jsonObject, "Operator")),
          colour: toString(get(jsonObject, "Colour"))
        }
      });
    }

    return [];
  }

  static parseAlltaskSubmissionforQuestionnaire(tsObject) {
    if (!tsObject) {
      return [];
    }
    const taskSubmissions = get(tsObject, "QuestionnaireSubmission.TaskSubmissions", "")

    if(get(tsObject, "Submission.TaskType", "") === 'questionnaire') {
      return [];
    }

    if (!taskSubmissions) {
      return [];
    }

    return taskSubmissions.map((taskSubmission) => {
      return {
        uuid: toString(get(taskSubmission, "UUID")),
        taskType: toString(get(taskSubmission, "TaskType")),
        status: toString(get(taskSubmission, "Status"))
      }
    });
  }
}
