// @flow

import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {SubmissionQuestionData, MyQuestionnaireItem} from "../types/Questionnaire";
import type {TaskSubmissionDisplay} from "../types/Task";
import QuestionParser from "../utils/QuestionParser";
import UserParser from "../utils/UserParser";

export default class QuestionnaireDataService {

  static async createInProgressSubmission(argument: { questionnaireID: string, csrfToken: string }): Promise<string> {
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
    IsSA
    IsCISO
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

    if (!memberData || !questionnaireData || !siteData) {
      throw DEFAULT_NETWORK_ERROR;
    }

    return {
      title: _.get(questionnaireData, "Name", ""),
      subtitle: _.get(siteData, "Title", ""),
      questionnaireID: _.get(questionnaireData, "ID", ""),
      keyInformation: _.get(questionnaireData, "KeyInformation", ""),
      user: UserParser.parseUserFromJSON(memberData),
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
    IsSA
    IsCISO
  }
  readQuestionnaireSubmission(UUID: "${submissionHash}") {
    ID
    UUID
    User {
      ID
    }
    SubmitterName,
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
    IsCurrentUserAnApprover
    TaskSubmissions {
      UUID
      TaskName
      TaskType
      Status
    }
  }
  readSiteConfig {
    Title
  }
}`;
    const json = await GraphQLRequestHelper.request({query});

    const memberData = _.get(json, "data.readCurrentMember.0", {});
    const submissionJSON = _.get(json, "data.readQuestionnaireSubmission.0", {});
    if (!memberData || !submissionJSON) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: QuestionnaireSubmissionState = {
      title: _.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
      siteTitle: _.toString(_.get(json, "data.readSiteConfig.0.Title", "")),
      user: UserParser.parseUserFromJSON(memberData),
      isCurrentUserApprover: _.get(submissionJSON, "IsCurrentUserAnApprover", "false") === "true",
      submission: {
        questionnaireID: _.toString(_.get(submissionJSON, "Questionnaire.ID", "")),
        questionnaireTitle: _.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
        submissionID: _.toString(_.get(submissionJSON, "ID", "")),
        submissionUUID: _.toString(_.get(submissionJSON, "UUID", "")),
        submitter: {
          id: _.toString(_.get(submissionJSON, "User.ID")),
          name: _.toString(_.get(submissionJSON, "SubmitterName", "")),
          email: _.toString(_.get(submissionJSON, "SubmitterEmail", "")),
          isSA: false,
          isCISO: false,
        },
        status: _.toString(_.get(submissionJSON, "QuestionnaireStatus", "")).toLowerCase().replace("-", "_"),
        approvalStatus: {
          chiefInformationSecurityOfficer: _.toString(_.get(submissionJSON, "CisoApprovalStatus", "")),
          businessOwner: _.toString(_.get(submissionJSON, "BusinessOwnerApprovalStatus", "")),
          securityArchitect: _.toString(_.get(submissionJSON, "SecurityArchitectApprovalStatus", "")),
        },
        questions: QuestionParser.parseQuestionsFromJSON({
          schemaJSON: _.toString(_.get(submissionJSON, "QuestionnaireData", "")),
          answersJSON: _.toString(_.get(submissionJSON, "AnswerData", "")),
        }),
        taskSubmissions: _
          .toArray(_.get(submissionJSON, "TaskSubmissions", []))
          .map((item) => {
            const taskSubmission: TaskSubmissionDisplay = {
              uuid: _.toString(_.get(item, "UUID", "")),
              taskName: _.toString(_.get(item, "TaskName", "")),
              taskType: _.toString(_.get(item, "TaskType", "")),
              status: _.toString(_.get(item, "Status", "")),
            };
            return taskSubmission;
          }),
      },
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

  static async submitQuestionnaire(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToSubmitted(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireStatusToSubmitted.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToSubmitted.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async submitQuestionnaireForApproval(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToWaitingForSecurityArchitectApproval(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireStatusToWaitingForSecurityArchitectApproval.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToWaitingForSecurityArchitectApproval.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async approveQuestionnaireSubmission(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireOnApproveByGroupMember(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireOnApproveByGroupMember.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireOnApproveByGroupMember.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async denyQuestionnaireSubmission(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireOnDenyByGroupMember(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(_.get(json, "data.updateQuestionnaireOnDenyByGroupMember.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireOnDenyByGroupMember.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async editQuestionnaireSubmission(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToInProgress(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(_.get(json, "data.updateQuestionnaireStatusToInProgress.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToInProgress.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async fetchUserSubmissionList(userID: string): Promise<Array<MyQuestionnaireItem>> {
    const query = `query {
      readQuestionnaireSubmission(UserID: "${userID}") {
        ID
        UUID
        QuestionnaireStatus
        QuestionnaireName
        Created
        ProductName
      }
    }`;

    const json = await GraphQLRequestHelper.request({query});

    // TODO: parse data
    const data = _.get(json, 'data.readQuestionnaireSubmission', []);
    if (!Array.isArray(data)) {
      throw 'error';
    }

    return data.map((item: any) : MyQuestionnaire => {
      let obj = {};
      obj['id'] = _.get(item, 'ID', '');
      obj['uuid'] = _.get(item, 'UUID', '');
      obj['status'] = _.get(item, 'QuestionnaireStatus', '');
      obj['productName'] = _.get(item, 'ProductName', '');
      obj['questionnaireName'] = _.get(item, 'QuestionnaireName', '');
      obj['created'] = _.get(item, 'Created', '');
      return obj;
    });
  }
}
