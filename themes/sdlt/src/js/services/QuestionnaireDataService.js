// @flow

import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {AnswerAction, AnswerInput, Question, Task} from "../types/Questionnaire";
import StringUtil from "../utils/StringUtil";

export default class QuestionnaireDataService {

  static async createInProgressSubmission(argument: {questionnaireID: string, csrfToken: string}): Promise<string> {
    const {questionnaireID, csrfToken} = {...argument};
    const query = `
mutation {
 createQuestionnaireSubmission(QuestionnaireID: ${questionnaireID}){
   UUID
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const submissionHash = _.get(json, "data.createQuestionnaireSubmission.UUID", null);
    if (!submissionHash) {
      throw DEFAULT_NETWORK_ERROR;
    }

    return submissionHash;
  }

  static async fetchStartData(questionnaireID: string): Promise<QuestionnaireStartState> {
    const query = `
query {
  readCurrentMember {
    Email
    FirstName
    Surname
    UserRole
  }
  readQuestionnaire(ID: ${questionnaireID}) {
    ID
    Name
    KeyInformation
  }
  readSiteConfig {
    Title
  }
}
`;

    const json = await GraphQLRequestHelper.request({query});
    const memberData = _.get(json, "data.readCurrentMember.0", null);
    const questionnaireData = _.get(json, "data.readQuestionnaire", null);
    const siteData = _.get(json, "data.readSiteConfig.0", null);

    if(!memberData || !questionnaireData || !siteData) {
      throw DEFAULT_NETWORK_ERROR;
    }

    return {
      title: _.get(questionnaireData, "Name", ""),
      subtitle: _.get(siteData, "Title", ""),
      questionnaireID: _.get(questionnaireData, "ID", ""),
      keyInformation: _.get(questionnaireData, "KeyInformation", ""),
      user: {
        name: `${_.get(memberData, "FirstName")} ${_.get(memberData, "Surname")}`,
        role: _.get(memberData, "UserRole"),
        email: _.get(memberData, "Email"),
      },
    };
  }

  static async fetchSubmissionData(submissionHash: string): Promise<QuestionnaireSubmissionState> {
    // TODO: need to fetch saved data at the same time

    const query = `
query {
  readCurrentMember {
    Email
    FirstName
    Surname
    UserRole
  }
  readQuestionnaireSubmission(UUID: "${submissionHash}") {
    ID
    UUID
    QuestionnaireStatus
    Questionnaire {
      ID
      Name
    }
    QuestionnaireData
  }
  readSiteConfig {
    Title
  }
}`;
    const json = await GraphQLRequestHelper.request({query});

    const memberData = _.get(json, "data.readCurrentMember.0", null);

    const submissionJSON = _.get(json, "data.readQuestionnaireSubmission.0", null);
    if(!submissionJSON) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const schema = JSON.parse(_.get(submissionJSON, "QuestionnaireData", ""));
    if(!schema || !Array.isArray(schema)) {
      throw DEFAULT_NETWORK_ERROR;
    }

    let status = StringUtil.toString(_.get(submissionJSON, "QuestionnaireStatus", "")).toLowerCase().replace("-","_");

    const data: QuestionnaireSubmissionState = {
      title: StringUtil.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
      subtitle: StringUtil.toString(_.get(json, "data.readSiteConfig.0.Title", "")),
      user: {
        name: `${_.get(memberData, "FirstName")} ${_.get(memberData, "Surname")}`,
        role: _.get(memberData, "UserRole"),
        email: _.get(memberData, "Email"),
      },
      submission: {
        questionnaireID: StringUtil.toString(_.get(submissionJSON, "Questionnaire.ID", "")),
        submissionID: StringUtil.toString(_.get(submissionJSON, "ID", "")),
        status: status,
        questions: schema.map((questionSchema, schemaIndex) => {
          let inputs = null;
          let actions = null;

          const inputSchemas = _.get(questionSchema, "AnswerInputFields", []);
          const actionSchemas = _.get(questionSchema, "AnswerActionFields", []);

          if (inputSchemas && Array.isArray(inputSchemas) && inputSchemas.length > 0) {
            inputs = inputSchemas.map((inputSchema) => {
              let type = StringUtil.toString(_.get(inputSchema, "InputType", "")).toLowerCase();
              const validTypes = ["text", "email", "textarea", "date"];
              if (!validTypes.includes(type)) {
                type = "text";
              }

              const input: AnswerInput = {
                id: StringUtil.toString(_.get(inputSchema, "ID", "")),
                label: StringUtil.toString(_.get(inputSchema, "Label", "")),
                type: type,
                required: Boolean(_.get(inputSchema, "Required", false)),
                minLength: Number.parseInt(StringUtil.toString(_.get(inputSchema, "MinLength", 0))),
                placeholder: StringUtil.toString(_.get(inputSchema, "PlaceHolder", "")),
                data: null
              };
              return input;
            });
          }

          if (actionSchemas && Array.isArray(actionSchemas) && actionSchemas.length > 0) {
            actions = actionSchemas.map((actionSchema) => {
              let type = StringUtil.toString(_.get(actionSchema, "ActionType", "")).toLowerCase();
              const validTypes = ["continue", "goto", "message", "finish"];
              if (!validTypes.includes(type)) {
                type = "continue";
              }

              const action: AnswerAction = {
                id: StringUtil.toString(_.get(actionSchema, "ID", "")),
                label: StringUtil.toString(_.get(actionSchema, "Label", "")),
                type: type,
                isChose: false,
              };

              if (type === "message") {
                action.message = StringUtil.toString(_.get(actionSchema, "Message", ""))
              }

              if (type === "goto") {
                action.goto = StringUtil.toString(_.get(actionSchema, "GotoID", ""));
              }

              return action;
            });
          }

          const question: Question = {
            id: StringUtil.toString(_.get(questionSchema, "ID", "")),
            title: StringUtil.toString(_.get(questionSchema, "Title", "")),
            heading: StringUtil.toString(_.get(questionSchema, "Question", "")),
            description: StringUtil.toString(_.get(questionSchema, "Description", "")),
            type: StringUtil.toString(_.get(questionSchema, "AnswerFieldType", "")).toLowerCase() === "input" ? "input" : "action",
            isCurrent: schemaIndex === 0,
            hasAnswer: false,
            isApplicable: true
          };

          if (inputs) {
            question.inputs = inputs;
          }
          if (actions) {
            question.actions = actions;
          }

          return question;
        })
      }
    };

    console.log(data);
    return data;
  }
}
