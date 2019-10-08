import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import get from "lodash/get";
import toString from "lodash/toString";
import SecurityComponentParser from "../utils/SecurityComponentParser";

export default class ControlValidationAuditDataService {
  static async fetchControlValidationAuditTaskSubmission(args: { uuid: string, secureToken?: string }): Promise<TaskSubmission> {
    const {uuid, secureToken} = {...args};
    const query = `
query {
  readTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}") {
    ID
    UUID
    QuestionnaireSubmission {
      UUID
    }
    TaskName
    CVATaskData
    ProductAspects
    Submitter {
      ID
    }
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const submissionJSONObject = get(responseJSONObject, "data.readTaskSubmission.0", null);

    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    let jsonArray = JSON.parse(get(submissionJSONObject, "CVATaskData", "[]"));

    if (!Array.isArray(jsonArray)) {
      jsonArray = [];
    }

    const components = jsonArray.length > 0 ? SecurityComponentParser.parseCVAFromJSONObject(jsonArray) : jsonArray;

    const data: TaskSubmission = {
      id: toString(get(submissionJSONObject, "ID", "")),
      uuid: toString(get(submissionJSONObject, "UUID", "")),
      questionnaireSubmissionUUID: toString(get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
      taskName: toString(get(submissionJSONObject, "TaskName", "")),
      selectedComponents: components,
      submitterID: toString(get(submissionJSONObject, "Submitter.ID", "")),
      productAspects:  _.has(submissionJSONObject, 'ProductAspects') ? JSON.parse(get(submissionJSONObject, "ProductAspects", [])) : [],
    };

    return data;
  }

  static async saveControlValidationAuditData(argument: {
    uuid: string,
    controlData: object,
    csrfToken: string
  }): Promise<void> {
    const {uuid, controlData, csrfToken} = {...argument};
    const controlDataStr = window.btoa(JSON.stringify(controlData));

    const query = `
mutation {
  updateControlValidationAuditTaskSubmission(UUID: "${uuid}", CVATaskData: "${controlDataStr}") {
    UUID
    CVATaskData
  }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = _.get(json, "data.updateControlValidationAuditTaskSubmission.CVATaskData", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }
}
