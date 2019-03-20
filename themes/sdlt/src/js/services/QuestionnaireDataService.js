// @flow

import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {AnswerAction, AnswerInput, Question, SubmissionQuestionData, Task} from "../types/Questionnaire";
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
    ID
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
        id: _.get(memberData, "ID"),
        name: `${_.get(memberData, "FirstName")} ${_.get(memberData, "Surname")}`,
        role: _.get(memberData, "UserRole"),
        email: _.get(memberData, "Email"),
      },
    };
  }

  static async fetchSubmissionData(submissionHash: string): Promise<QuestionnaireSubmissionState> {
    const query = `
query {
  readCurrentMember {
    ID
    Email
    FirstName
    Surname
    UserRole
  }
  readQuestionnaireSubmission(UUID: "${submissionHash}") {
    ID
    UUID
    User {
      ID
    }
    SubmitterName,
    SubmitterRole,
    SubmitterEmail,
    QuestionnaireStatus
    Questionnaire {
      ID
      Name
    }
    QuestionnaireData
    AnswerData
    CisoApprovalStatus
    BusinessOwnerApprovalStatus
    SecurityArchitectApprovalStatus
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

    // Construct answers object for data parse (need key to be string)
    const answersJSON = _.get(submissionJSON, "AnswerData", "");
    const answersRaw = answersJSON ? JSON.parse(answersJSON) : {};
    const answers = {};
    if (answersRaw) {
      _.keys(answersRaw).forEach((key) => {
        answers[StringUtil.toString(key)] = answersRaw[key];
      });
    }

    // Find the current question
    let currentQuestionID;
    _.keys(answers).forEach((questionID) => {
      const answer = answers[questionID];
      if (!currentQuestionID && Boolean(_.get(answer, `isCurrent`, false))) {
        currentQuestionID = questionID;
      }
    });

    let status = StringUtil.toString(_.get(submissionJSON, "QuestionnaireStatus", "")).toLowerCase().replace("-","_");

    const data: QuestionnaireSubmissionState = {
      title: StringUtil.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
      siteTitle: StringUtil.toString(_.get(json, "data.readSiteConfig.0.Title", "")),
      user: {
        id: StringUtil.toString(_.get(memberData, "ID")),
        name: `${_.get(memberData, "FirstName")} ${_.get(memberData, "Surname")}`,
        role: _.get(memberData, "UserRole"),
        email: _.get(memberData, "Email"),
      },
      submission: {
        questionnaireID: StringUtil.toString(_.get(submissionJSON, "Questionnaire.ID", "")),
        questionnaireTitle: StringUtil.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
        submissionID: StringUtil.toString(_.get(submissionJSON, "ID", "")),
        submissionUUID: StringUtil.toString(_.get(submissionJSON, "UUID", "")),
        submitter: {
          id: StringUtil.toString(_.get(submissionJSON, "User.ID")),
          name: StringUtil.toString(_.get(submissionJSON, "SubmitterName", "")),
          role: StringUtil.toString(_.get(submissionJSON, "SubmitterRole", "")),
          email: StringUtil.toString(_.get(submissionJSON, "SubmitterEmail", "")),
        },
        status: status,
        approvalStatus: {
          chiefInformationSecurityOfficer: StringUtil.toString(_.get(submissionJSON, "CisoApprovalStatus", "")),
          businessOwner: StringUtil.toString(_.get(submissionJSON, "BusinessOwnerApprovalStatus", "")),
          securityArchitect: StringUtil.toString(_.get(submissionJSON, "SecurityArchitectApprovalStatus", ""))
        },
        questions: schema.map((questionSchema, schemaIndex) => {
          const questionID = StringUtil.toString(_.get(questionSchema, "ID", ""));
          const hasAnswer = Boolean(_.get(answers, `${questionID}.hasAnswer`, false));
          const isApplicable = Boolean(_.get(answers, `${questionID}.isApplicable`, true));

          let isCurrent = false;
          if (currentQuestionID) {
            isCurrent = (currentQuestionID === questionID);
          } else {
            // The first question will be the current one by default
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
              let type = StringUtil.toString(_.get(inputSchema, "InputType", "")).toLowerCase();
              const validTypes = ["text", "email", "textarea", "date"];
              if (!validTypes.includes(type)) {
                type = "text";
              }

              const inputID = StringUtil.toString(_.get(inputSchema, "ID", ""));
              const input: AnswerInput = {
                id: inputID,
                label: StringUtil.toString(_.get(inputSchema, "Label", "")),
                type: type,
                required: Boolean(_.get(inputSchema, "Required", false)),
                minLength: Number.parseInt(StringUtil.toString(_.get(inputSchema, "MinLength", 0))),
                placeholder: StringUtil.toString(_.get(inputSchema, "PlaceHolder", "")),
                data: null
              };

              // Data of input
              if (inputAnswers && Array.isArray(inputAnswers) && inputAnswers.length > 0) {
                const answer = _.head(inputAnswers.filter((answer) => answer.id === inputID));
                if (answer) {
                  const inputData = StringUtil.toString(_.get(answer, "data", null));
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
              let type = StringUtil.toString(_.get(actionSchema, "ActionType", "")).toLowerCase();
              const validTypes = ["continue", "goto", "message", "finish"];
              if (!validTypes.includes(type)) {
                type = "continue";
              }

              const actionID = StringUtil.toString(_.get(actionSchema, "ID", ""));
              const action: AnswerAction = {
                id: actionID,
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
            title: StringUtil.toString(_.get(questionSchema, "Title", "")),
            heading: StringUtil.toString(_.get(questionSchema, "Question", "")),
            description: StringUtil.toString(_.get(questionSchema, "Description", "")),
            type: StringUtil.toString(_.get(questionSchema, "AnswerFieldType", "")).toLowerCase() === "input" ? "input" : "action",
            isCurrent: isCurrent,
            hasAnswer: hasAnswer,
            isApplicable: isApplicable
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

    return data;
  }

  static async updateSubmissionData(argument: {
    submissionID: string,
    questionID: string,
    answerData: SubmissionQuestionData,
    csrfToken: string
  }): Promise<void> {
    const {submissionID, questionID, answerData, csrfToken} = {...argument};
    const answerDataStr = window.btoa(JSON.stringify(answerData));

    const query = `
mutation {
  updateQuestionnaireSubmission(ID: "${submissionID}", QuestionID: "${questionID}", AnswerData: "${answerDataStr}") {
    ID
    AnswerData
  }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = _.get(json, "data.updateQuestionnaireSubmission.AnswerData", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async batchUpdateSubmissionData(argument: {
    submissionID: string,
    questionIDList: Array<string>,
    answerDataList: Array<SubmissionQuestionData>,
    csrfToken: string
  }): Promise<void> {
    const {submissionID, questionIDList, answerDataList, csrfToken} = {...argument};

    if (questionIDList.length !== answerDataList.length) {
      throw DEFAULT_NETWORK_ERROR;
    }


    let mutations = [];
    for (let index = 0; index < questionIDList.length; index++) {
      const questionID = questionIDList[index];
      const answerData = answerDataList[index];
      const answerDataStr = window.btoa(JSON.stringify(answerData));
      const singleQuery = `
updateQuestion${questionID}: updateQuestionnaireSubmission(ID: "${submissionID}", QuestionID: "${questionID}", AnswerData: "${answerDataStr}") {
  ID
  AnswerData
}`;
      mutations.push(singleQuery);
    }

    let query = `
mutation {
  ${mutations.join("\n")}
}
`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = _.get(json, "data", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async submitQuestionnaire(argument: {submissionID: string, csrfToken: string}): Promise<{uuid: string}> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToSubmitted(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = StringUtil.toString(_.get(json, "data.updateQuestionnaireStatusToSubmitted.QuestionnaireStatus", null));
    const uuid = StringUtil.toString(_.get(json, "data.updateQuestionnaireStatusToSubmitted.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    if (status !== "submitted") {
      throw new Error(`Submit questionnaire failed, the status is ${status}`);
    }

    return {uuid};
  }

  static async submitQuestionnaireForApproval(argument: {submissionID: string, csrfToken: string}): Promise<{uuid: string}> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToWaitingForApproval(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = StringUtil.toString(_.get(json, "data.updateQuestionnaireStatusToWaitingForApproval.QuestionnaireStatus", null));
    const uuid = StringUtil.toString(_.get(json, "data.updateQuestionnaireStatusToWaitingForApproval.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    if (status !== "waiting_for_appraval") {
      throw new Error(`Submit questionnaire for approval failed, the status is ${status}`);
    }

    return {uuid};
  }
}
