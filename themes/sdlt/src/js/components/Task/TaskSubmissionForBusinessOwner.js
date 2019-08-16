// @flow

import React, {Component} from "react";
import type {TaskSubmission} from "../../types/Task";
import TaskForBusinessOwnerDataService from "../../services/TaskForBusinessOwnerDataService";
import Footer from "../Footer/Footer";
import AnswersPreview from "../Questionnaire/AnswersPreview";
import DarkButton from "../Button/DarkButton";
import URLUtil from "../../utils/URLUtil";
import Header from "../Header/Header";
import LightButton from "../Button/LightButton";
import pdfIcon from "../../../img/icons/pdf.svg";
import PDFUtil from "../../utils/PDFUtil";

type Props = {
  uuid: string,
  token: string
};

type State = {
  siteTitle: string,
  taskSubmission: TaskSubmission | null,
};

export default class TaskSubmissionForBusinessOwner extends Component<Props, State> {

  constructor(props: *) {
    super(props);

    this.state = {
      siteTitle: "",
      taskSubmission: null,
    };
  }

  async componentDidMount() {
    await this.loadData();
  }

  render() {
    const {siteTitle, taskSubmission} = {...this.state};
    const {token} = {...this.props};

    if (!taskSubmission) {return null;}

    const result = taskSubmission.result && taskSubmission.status === "complete" ? (
      <div className="result">
        <h3>Result:</h3>
        <div>{taskSubmission.result}</div>
      </div>
    ) : null;

    const backButton = taskSubmission.questionnaireSubmissionUUID ? (
      <DarkButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID, token);
        }}
      />
    ) : null;

    const pdfButton = (
      <LightButton title={"DOWNLOAD PDF"} iconImage={pdfIcon} onClick={() => this.downloadPdf()}/>
    );

    return (
      <div className="TaskSubmissionContainer">
        <Header title={taskSubmission.taskName} subtitle={siteTitle} showLogoutButton={false}/>
        <div className="TaskSubmission">
          {result}
          <AnswersPreview questions={taskSubmission.questions}/>

          <div className="buttons">
            {pdfButton}
            {backButton}
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  async loadData() {
    const {uuid, token} = {...this.props};
    const data = await TaskForBusinessOwnerDataService.fetchTaskSubmissionData({uuid, token});
    this.setState(data);
  }

  downloadPdf() {
    const {
      taskSubmission,
      siteTitle
    } = {...this.state};

    if (!taskSubmission) {
      return;
    }

    PDFUtil.generatePDF({
      questions: taskSubmission.questions,
      submitter: taskSubmission.submitter,
      questionnaireTitle: taskSubmission.taskName,
      siteTitle: siteTitle,
      result: taskSubmission.result,
    });
  }
}
