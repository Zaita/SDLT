// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Submission} from "../types/Questionnaire";

export default class TaskDataService {

  static async createTasksForQuestionnaireSubmission(argument: {
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
        if (!taskID) {
          return;
        }

        taskIDList.push(taskID);
      });
    });

    // Create task submissions in a batch manner
    const mutations = [];
    _.uniq(taskIDList).forEach((taskID) => {
      const query = `
createTaskSubmission${taskID}: createTaskSubmission(taskID: "${taskID}", questionnaireSubmissionID: "${questionnaireSubmission.submissionID}") {
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
}
