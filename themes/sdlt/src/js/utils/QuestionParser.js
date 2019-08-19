// @flow

import type {AnswerAction, AnswerInput, Question} from "../types/Questionnaire";
import _ from "lodash";
import {DEFAULT_PARSE_ERROR} from "../constants/errors";


function parseAnswersFromJSON(answersJSON: string): Object {
  if (!answersJSON) {
    return {};
  }

  const jsonObject = JSON.parse(answersJSON);
  const answers = {};
  if (jsonObject) {
    _.keys(jsonObject).forEach((key) => {
      answers[_.toString(key)] = jsonObject[key];
    });
  }
  return answers;
}

function parseSchemaFromJSON(schemaJSON: string): Array<*> {
  const schema = JSON.parse(schemaJSON);
  if(!schema || !Array.isArray(schema)) {
    throw DEFAULT_PARSE_ERROR;
  }
  return schema;
}

function findCurrentQuestionID(answers: Object): string {
  let currentQuestionID = "";
  _.keys(answers).forEach((questionID) => {
    const answer = answers[questionID];
    if (!currentQuestionID && Boolean(_.get(answer, `isCurrent`, false))) {
      currentQuestionID = questionID;
    }
  });

  return currentQuestionID;
}

export default class QuestionParser {

  static parseQuestionsFromJSON(argument: {
    schemaJSON: string,
    answersJSON: string
  }): Array<Question> {
    const {schemaJSON, answersJSON} = {...argument};

    const schema = parseSchemaFromJSON(schemaJSON);
    const answers = parseAnswersFromJSON(answersJSON);
    const currentQuestionID = findCurrentQuestionID(answers);

    return schema.map((questionSchema, schemaIndex) => {
      const questionID = _.toString(_.get(questionSchema, "ID", ""));
      const hasAnswer = Boolean(_.get(answers, `${questionID}.hasAnswer`, false));
      const isApplicable = Boolean(_.get(answers, `${questionID}.isApplicable`, true));

      // Mark the question as the current one if it is
      // Otherwise the first question will be the current one by default
      let isCurrent = false;
      if (currentQuestionID) {
        isCurrent = (currentQuestionID === questionID);
      } else {
        isCurrent = (schemaIndex === 0);
      }

      let inputs = null;
      let actions = null;

      const inputAnswers = hasAnswer ? _.get(answers, `${questionID}.inputs`, []) : [];
      const actionAnswers = hasAnswer ? _.get(answers, `${questionID}.actions`, []) : [];

      const inputSchemas = _.get(questionSchema, "AnswerInputFields", []);
      const actionSchemas = _.get(questionSchema, "AnswerActionFields", []);

      if (inputSchemas && Array.isArray(inputSchemas) && inputSchemas.length > 0) {
        inputs = inputSchemas.map((inputSchema) => {
          // Schema of input
          let type = _.toString(_.get(inputSchema, "InputType", "")).toLowerCase();
          if (type === "multiple-choice: single selection") {
            type = "radio"
          }
          if (type === "multiple-choice: multiple selection") {
            type = "checkbox"
          }
          const validTypes = ["text", "email", "textarea", "date", "url", "radio", "checkbox"];
          if (!validTypes.includes(type)) {
            type = "text";
          }

          const inputID = _.toString(_.get(inputSchema, "ID", ""));

          const input: AnswerInput = {
            id: inputID,
            label: _.toString(_.get(inputSchema, "Label", "")),
            type: type,
            required: Boolean(_.toInteger(_.get(inputSchema, "Required", false))),
            minLength: Number.parseInt(_.toString(_.get(inputSchema, "MinLength", 0))),
            maxLength: Number.parseInt(_.toString(_.get(inputSchema, "MaxLength", 0))),
            placeholder: _.toString(_.get(inputSchema, "PlaceHolder", "")),
            options: _.has(inputSchema, 'MultiChoiceAnswer') ? JSON.parse(_.get(inputSchema, "MultiChoiceAnswer", "")) : "",
            defaultRadioButtonValue: _.has(inputSchema, 'MultiChoiceSingleAnswerDefault') ? _.toString(_.get(inputSchema, "MultiChoiceSingleAnswerDefault", "")) : "",
            defaultCheckboxValue: _.has(inputSchema, 'MultiChoiceMultipleAnswerDefault') ? _.get(inputSchema, "MultiChoiceMultipleAnswerDefault", "") : "",
            data: null,
          };

          // Data of input
          if (inputAnswers && Array.isArray(inputAnswers) && inputAnswers.length > 0) {
            const answer = _.head(inputAnswers.filter((answer) => answer.id === inputID));
            if (answer) {
              const inputData = _.toString(_.get(answer, "data", null));
              if (inputData) {
                input.data = inputData;
              }
            }
          }

          return input;
        });
      }




      if (actionSchemas && Array.isArray(actionSchemas) && actionSchemas.length > 0) {
        actions = actionSchemas.map((actionSchema) => {
          // Schema of action
          let type = _.toString(_.get(actionSchema, "ActionType", "")).toLowerCase();
          const validTypes = ["continue", "goto", "message", "finish"];
          if (!validTypes.includes(type)) {
            type = "continue";
          }

          const actionID = _.toString(_.get(actionSchema, "ID", ""));
          const action: AnswerAction = {
            id: actionID,
            label: _.toString(_.get(actionSchema, "Label", "")),
            type: type,
            isChose: false,
          };

          if (type === "message") {
            action.message = _.toString(_.get(actionSchema, "Message", ""));
          }

          if (type === "goto") {
            action.goto = _.toString(_.get(actionSchema, "GotoID", ""));
          }

          if (type === "finish") {
            action.result = _.toString(_.get(actionSchema, "Result", ""));
          }

          // Task of action
          const taskID = _.toString(_.get(actionSchema, "TaskID", ""));
          action.taskID = taskID;

          // Data of action
          if (actionAnswers && Array.isArray(actionAnswers) && actionAnswers.length > 0) {
            const answer = _.head(actionAnswers.filter((answer) => answer.id === actionID));
            if (answer) {
              const isChose = Boolean(_.get(answer, "isChose", false));
              action.isChose = isChose;
            }
          }

          return action;
        });
      }

      const question: Question = {
        id: questionID,
        title: _.toString(_.get(questionSchema, "Title", "")),
        heading: _.toString(_.get(questionSchema, "Question", "")),
        description: _.toString(_.get(questionSchema, "Description", "")),
        type: _.toString(_.get(questionSchema, "AnswerFieldType", "")).toLowerCase() === "input" ? "input" : "action",
        isCurrent: isCurrent,
        hasAnswer: hasAnswer,
        isApplicable: isApplicable,
      };

      if (inputs) {
        question.inputs = inputs;
      }
      if (actions) {
        question.actions = actions;
      }

      return question;
    });
  }
}
