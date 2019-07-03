// @flow

import toString from "lodash/toString";
import get from "lodash/get";
import type {Task} from "../types/Task";
import QuestionParser from "./QuestionParser";

export default class TaskParser {

  static parseFromJSONObject(jsonObject: *): Task {
    const id = toString(get(jsonObject, "ID", ""));
    const name = toString(get(jsonObject, "Name", ""));

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

    return {id, name, type, questions};
  }
}
