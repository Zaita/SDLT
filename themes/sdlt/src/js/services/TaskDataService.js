// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import get from "lodash/get";
import toString from "lodash/toString";
import uniq from "lodash/uniq";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Question, SubmissionQuestionData} from "../types/Questionnaire";
import QuestionParser from "../utils/QuestionParser";
import type {Task, TaskSubmission} from "../types/Task";
import UserParser from "../utils/UserParser";
import TaskParser from "../utils/TaskParser";
import SecurityComponentParser from "../utils/SecurityComponentParser";
import JiraTicketParser from "../utils/JiraTicketParser";

type BatchUpdateTaskSubmissionDataArgument = {
  uuid: string,
  questionIDList: Array<string>,
  answerDataList: Array<SubmissionQuestionData>,
  csrfToken: string,
  secureToken?: string,
};

export default class TaskDataService {

  static async fetchTaskSubmission(args: { uuid: string, secureToken?: string }): Promise<TaskSubmission> {
    const {uuid, secureToken} = {...args};
    const query = `
query {
  readTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}") {
    ID
    UUID
    TaskName
    TaskType
    Status
    Result
    LockAnswersWhenComplete
    QuestionnaireSubmission {
      ID
      UUID
      QuestionnaireStatus
    }
    Submitter {
      ID
      Email
      FirstName
      Surname
      IsSA
      IsCISO
    }
    QuestionnaireData
    AnswerData
    SelectedComponents {
      ID
      Name
      Description
    }
    JiraTickets {
      ID
      JiraKey
      TicketLink
    }
    IsTaskApprovalRequired
    IsCurrentUserAnApprover
    RiskResultData
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const submissionJSONObject = get(responseJSONObject, "data.readTaskSubmission.0", null);
    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: TaskSubmission = {
      id: toString(get(submissionJSONObject, "ID", "")),
      uuid: toString(get(submissionJSONObject, "UUID", "")),
      taskName: toString(get(submissionJSONObject, "TaskName", "")),
      taskType: toString(get(submissionJSONObject, "TaskType", "")),
      status: toString(get(submissionJSONObject, "Status", "")),
      result: toString(get(submissionJSONObject, "Result", "")),
      submitter: UserParser.parseUserFromJSON(get(submissionJSONObject, "Submitter")),
      lockWhenComplete: Boolean(get(submissionJSONObject, "LockAnswersWhenComplete", false)),
      questionnaireSubmissionUUID: toString(get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
      questionnaireSubmissionID: toString(get(submissionJSONObject, "QuestionnaireSubmission.ID", "")),
      questionnaireSubmissionStatus: toString(get(submissionJSONObject, "QuestionnaireSubmission.QuestionnaireStatus", "")),
      questions: QuestionParser.parseQuestionsFromJSON({
        schemaJSON: toString(get(submissionJSONObject, "QuestionnaireData", "")),
        answersJSON: toString(get(submissionJSONObject, "AnswerData", "")),
      }),
      selectedComponents: SecurityComponentParser.parseFromJSONOArray(get(submissionJSONObject, "SelectedComponents", [])),
      jiraTickets: JiraTicketParser.parseFromJSONArray(get(submissionJSONObject, "JiraTickets", [])),
      isCurrentUserAnApprover:  _.get(submissionJSONObject, "IsCurrentUserAnApprover", "false") === "true",
      isTaskApprovalRequired: get(submissionJSONObject, "IsTaskApprovalRequired", false) === "true",
      riskResults: _.has(submissionJSONObject, 'RiskResultData') ? JSON.parse(_.get(submissionJSONObject, "RiskResultData", "[]")) : "[]"
    };

    return data;
  }

  static async batchUpdateTaskSubmissionData(args: BatchUpdateTaskSubmissionDataArgument): Promise<void> {
    const {uuid, questionIDList, answerDataList, csrfToken, secureToken} = {...args};

    if (questionIDList.length !== answerDataList.length) {
      throw DEFAULT_NETWORK_ERROR;
    }

    let mutations = [];
    for (let index = 0; index < questionIDList.length; index++) {
      const questionID = questionIDList[index];
      const answerData = answerDataList[index];
      const answerDataStr = window.btoa(JSON.stringify(answerData));
      let singleQuery = `
updateQuestion${questionID}: updateTaskSubmission(
  UUID: "${uuid}",
  QuestionID: "${questionID}",
  AnswerData: "${answerDataStr}",
  SecureToken: "${secureToken || ""}"
) {
  UUID
  Status
}`;
      mutations.push(singleQuery);
    }

    let query = `
mutation {
  ${mutations.join("\n")}
}
`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = get(json, "data", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async completeTaskSubmission(args: {
    uuid: string,
    result: string,
    csrfToken: string,
    secureToken: string
  }): Promise<{ uuid: string }> {
    const {uuid, result, csrfToken, secureToken} = {...args};
    let query = `
mutation {
 completeTaskSubmission(UUID: "${uuid}", Result: "${result}", SecureToken: "${secureToken || ""}") {
   UUID
   Status
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!get(json, "data.completeTaskSubmission.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async editTaskSubmission(args: { uuid: string, csrfToken: string, secureToken?: string }): Promise<{ uuid: string }> {
    const {uuid, csrfToken, secureToken} = {...args};

    const query = `
mutation {
 editTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}") {
   UUID
   Status
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!get(json, "data.editTaskSubmission.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async fetchStandaloneTask(args: { taskId: string }): Promise<Task> {
    const {taskId} = {...args};
    const query = `
query {
  readTask(ID: "${taskId}") {
    ID
    Name
    TaskType
    QuestionsDataJSON
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const taskJSONObject = get(responseJSONObject, "data.readTask", null);
    if (!taskJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }
    const task = TaskParser.parseFromJSONObject(taskJSONObject);

    return task;
  }

  static async updateTaskSubmissionWithSelectedComponents(
    args: {
      uuid: string,
      csrfToken: string,
      componentIDs: Array<string>,
      jiraKey: string
    }
  ): Promise<{ uuid: string }> {
    const {uuid, csrfToken, componentIDs, jiraKey} = {...args};

    const query = `
mutation {
 updateTaskSubmissionWithSelectedComponents(
 UUID: "${uuid}",
 ComponentIDs: "${window.btoa(JSON.stringify(componentIDs))}",
 JiraKey: "${jiraKey}"
 ) {
   UUID
   Status
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!get(json, "data.updateTaskSubmissionWithSelectedComponents.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async approveTaskSubmission(argument: { uuid: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {uuid, csrfToken} = {...argument};
    const query = `
mutation {
 updateTaskStatusToApproved(UUID: "${uuid}") {
   Status
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateTaskStatusToApproved.Status", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {status};
  }

  static async denyTaskSubmission(argument: { uuid: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {uuid, csrfToken} = {...argument};
    const query = `
mutation {
 updateTaskStatusToDenied(UUID: "${uuid}") {
   Status
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateTaskStatusToDenied.Status", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {status};
  }
}
