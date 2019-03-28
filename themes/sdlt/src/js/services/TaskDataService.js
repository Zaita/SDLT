// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Submission, SubmissionQuestionData} from "../types/Questionnaire";
import QuestionParser from "../utils/QuestionParser";
import UserParser from "../utils/UserParser";
import type {TaskSubmissionState} from "../store/TaskSubmissionState";

type BatchUpdateTaskSubmissionDataArgument = {
  uuid: string,
  questionIDList: Array<string>,
  answerDataList: Array<SubmissionQuestionData>,
  csrfToken: string
};

export default class TaskDataService {

  static async createTaskSubmissionsForQuestionnaireSubmission(argument: {
    questionnaireSubmission: Submission,
    csrfToken: string,
  }): Promise<void> {
    const {questionnaireSubmission, csrfToken} = {...argument};

    // Find task id list for questionnaire submission
    const taskIDList = [];
    questionnaireSubmission.questions.forEach((question) => {
      // Only action question can generate tasks
      if (question.type !== "action") {
        return;
      }

      // Action data need to be valid
      const actions = question.actions;
      if (!actions || !Array.isArray(actions)) {
        throw new Error("Invalid questionnaire data, please reload the questionnaire");
      }

      // Push task id to the list
      actions.forEach((action) => {
        if (!action.isChose) {
          return;
        }

        const taskID = action.taskID;
        if (!taskID || Number.parseInt(taskID) <= 0) {
          return;
        }

        taskIDList.push(taskID);
      });
    });

    const uniqueTaskIDList = _.uniq(taskIDList);

    // Stop if there is no task to create
    if (uniqueTaskIDList.length  === 0) {
      return;
    }

    // Create task submissions in a batch manner
    const mutations = [];
    uniqueTaskIDList.forEach((taskID) => {
      const query = `
createTaskSubmission${taskID}: createTaskSubmission(TaskID: "${taskID}", QuestionnaireSubmissionID: "${questionnaireSubmission.submissionID}") {
  ID
  UUID
}`;
      mutations.push(query);
    });

    const query = `
mutation {
  ${mutations.join("\n")}
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = _.get(json, "data", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async fetchTaskSubmissionState(uuid: string): Promise<TaskSubmissionState> {
    const query = `
query {
  readSiteConfig {
    Title
  }
  readCurrentMember {
    ID
    Email
    FirstName
    Surname
    UserRole
  }
  readTaskSubmission(UUID: "${uuid}") {
    ID
    UUID
    TaskName
    Status
    Result
    QuestionnaireSubmission {
      UUID
    }
    QuestionnaireData
    AnswerData
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});

    const currentMemberJSONObject = _.get(responseJSONObject, "data.readCurrentMember.0", {});
    const submissionJSONObject = _.get(responseJSONObject, "data.readTaskSubmission.0", {});
    if (!currentMemberJSONObject || !submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: TaskSubmissionState = {
      siteTitle: _.toString(_.get(responseJSONObject, "data.readSiteConfig.0.Title", "")),
      currentUser: UserParser.parseUserFromJSON(currentMemberJSONObject),
      taskSubmission: {
        id: _.toString(_.get(submissionJSONObject, "ID", "")),
        uuid: _.toString(_.get(submissionJSONObject, "UUID", "")),
        taskName: _.toString(_.get(submissionJSONObject, "TaskName", "")),
        status: _.toString(_.get(submissionJSONObject, "Status", "")),
        result: _.toString(_.get(submissionJSONObject, "Result", "")),
        questionnaireSubmissionUUID: _.toString(_.get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
        questions: QuestionParser.parseQuestionsFromJSON({
          schemaJSON: _.toString(_.get(submissionJSONObject, "QuestionnaireData", "")),
          answersJSON: _.toString(_.get(submissionJSONObject, "AnswerData", "")),
        }),
      },
    };

    return data;
  }

  static async batchUpdateTaskSubmissionData(argument: BatchUpdateTaskSubmissionDataArgument): Promise<void> {
    const {uuid, questionIDList, answerDataList, csrfToken} = {...argument};

    if (questionIDList.length !== answerDataList.length) {
      throw DEFAULT_NETWORK_ERROR;
    }

    let mutations = [];
    for (let index = 0; index < questionIDList.length; index++) {
      const questionID = questionIDList[index];
      const answerData = answerDataList[index];
      const answerDataStr = window.btoa(JSON.stringify(answerData));
      const singleQuery = `
updateQuestion${questionID}: updateTaskSubmission(UUID: "${uuid}", QuestionID: "${questionID}", AnswerData: "${answerDataStr}") {
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
    const updatedData = _.get(json, "data", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async completeTaskSubmission(argument: {
    uuid: string,
    result: string,
    csrfToken: string
  }): Promise<{ uuid: string }> {
    const {uuid, result, csrfToken} = {...argument};
    let query = `
mutation {
 completeTaskSubmission(UUID: "${uuid}", Result: "${result}") {
   UUID
   Status
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!_.get(json, "data.completeTaskSubmission.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async editTaskSubmission(argument: { uuid: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {uuid, csrfToken} = {...argument};
    const query = `
mutation {
 editTaskSubmission(UUID: "${uuid}") {
   UUID
   Status
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    if (!_.get(json, "data.editTaskSubmission.UUID", null)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }
}
