// @flow

import type {QuestionnaireSubmissionState} from "../src/js/store/QuestionnaireState";

const fixture: QuestionnaireSubmissionState = {
  title: "Proof of Concept or Software Trial Request Form",
  siteTitle: "Security Development Lifecycle Tool",
  user: {
    id: "1",
    name: "Thor Chen",
    role: "Developer",
    email: "thor.chen@catalyst.net.nz"
  },
  isCurrentUserApprover: false,
  submission: {
    questionnaireID: "1",
    questionnaireTitle: "Proof of Concept or Software Trial Request Form",
    submissionID: "1",
    submissionUUID: "uuid",
    submitter: {
      id: "1",
      name: "Thor Chen",
      role: "Developer",
      email: "thor.chen@catalyst.net.nz"
    },
    approvalStatus: {
      chiefInformationSecurityOfficer: "not_applicable",
      businessOwner: "not_applicable",
      securityArchitect: "not_applicable"
    },
    questions: [
      {
        id: "first_question",
        title: "First Question",
        heading: "This is a fieldset",
        description: "",
        type: "input",
        inputs: [
          {
            id: "1",
            label: "Product Name",
            type: "text",
            required: true,
            minLength: 5,
            placeholder: "text",
            data: null
          },
          {
            id: "2",
            label: "Contact Email",
            type: "email",
            required: true,
            minLength: 5,
            placeholder: "email",
            data: null
          },
          {
            id: "3",
            label: "Text Area",
            type: "textarea",
            required: true,
            minLength: 5,
            placeholder: "textarea",
            data: null
          },
          {
            id: "4",
            label: "date",
            type: "date",
            required: true,
            minLength: 5,
            placeholder: "date",
            data: null
          },

        ],
        isCurrent: true,
        hasAnswer: false,
        isApplicable: true
      },
      {
        id: "second_question",
        title: "Second Question",
        heading: "Second Question",
        description: "Choose yes to continue, choose no to show message",
        type: "action",
        actions: [
          {
            id: "1",
            label: "YES",
            type: "continue",
            isChose: false
          },
          {
            id: "2",
            label: "NO",
            type: "message",
            isChose: false,
            message: `Stop doing this questionnaire and <a href="https://www.google.com" target="_blank">go to google</a>!!!`
          }
        ],
        isCurrent: false,
        hasAnswer: false,
        isApplicable: true
      },
      {
        id: "third_question",
        title: "Third Question",
        heading: "Choose yes to continue, choose no to goto the fifth question",
        description: "",
        type: "action",
        actions: [
          {
            id: "3",
            label: "YES",
            type: "continue",
            isChose: false
          },
          {
            id: "4",
            label: "NO",
            type: "goto",
            isChose: false,
            goto: "fifth_question"
          }
        ],
        isCurrent: false,
        hasAnswer: false,
        isApplicable: true
      },
      {
        id: "forth_question",
        title: "Forth Question",
        heading: "Choose next to continue, choose review to finish",
        description: "",
        type: "action",
        actions: [
          {
            id: "5",
            label: "Next",
            type: "continue",
            isChose: false,
            task: {
              id: "dummy_task"
            }
          },
          {
            id: "6",
            label: "Review",
            type: "finish",
            isChose: false,
            task: {
              id: "dummy_task"
            }
          },
        ],
        isCurrent: false,
        hasAnswer: false,
        isApplicable: true
      },
      {
        id: "fifth_question",
        title: "Fifth Question",
        heading: "Choose review to finish with task",
        description: "",
        type: "action",
        actions: [
          {
            id: "6",
            label: "Review",
            type: "finish",
            isChose: false,
            task: {
              id: "dummy_task"
            }
          },
        ],
        isCurrent: false,
        hasAnswer: false,
        isApplicable: true
      }
    ],
    status: "in_progress"
  }
};

export default fixture;
