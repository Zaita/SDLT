// @flow

import React, {Component} from "react";
import type {Submission} from "../../types/Questionnaire";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import pdfIcon from "../../../img/icons/pdf.svg";
import AnswersPreview from "./AnswersPreview";
import {Link} from "react-router-dom";
import editIcon from "../../../img/icons/edit.svg";
import _ from "lodash";

type Props = {
  submission: Submission | null,
  handlePDFDownloadButtonClick: () => void,
  handleSubmitButtonClick: () => void,
  handleApproveButtonClick: () => void,
  handleDenyButtonClick: () => void,
  viewAs: "submitter" | "approver" | "others"
};

const prettifyStatus = (status: string) => {
  return status
    .split("_")
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    })
    .join(" ");
};

class Summary extends Component<Props> {

  render() {
    const {submission} = {...this.props};

    if (!submission) {
      return null;
    }

    if (submission.status === "in_progress") {
      return (
        <div className="Summary">
          <h3>
            Submission has not been complete...
          </h3>
        </div>
      );
    }

    return (
      <div className="Summary">
        {this.renderSubmitterInfo(submission)}
        <div className="answers">
          <h3>Answers</h3>
        </div>
        <AnswersPreview submission={submission}/>
        {this.renderApprovals(submission)}
        {this.renderButtons(submission)}
      </div>
    );
  }

  renderSubmitterInfo(submission: Submission) {
    const submitter = submission.submitter;

    return (
      <div className="request-info">
        <h3>Request Information</h3>
        <div><b>Submitted by:</b> {submitter.name}</div>
        <div><b>Role:</b> {submitter.role}</div>
        <div><b>Email:</b> {submitter.email}</div>
        <div><b>Status:</b> {prettifyStatus(submission.status)}</div>
      </div>
    );
  }

  renderTasks(tasks: Array<{ name: string, url: string, status: string }>) {
    // TODO: Render tasks with links to complete them
    return (
      <div className="tasks">
        <h3>Tasks</h3>
        {tasks.map((task) => {
          return (
            <div key={task.name}><Link to={task.url}>{task.name} ({task.status})</Link></div>
          );
        })}
      </div>
    );
  }

  renderButtons(submission: Submission) {
    const {
      viewAs,
      handleSubmitButtonClick,
      handlePDFDownloadButtonClick,
      handleApproveButtonClick,
      handleDenyButtonClick
    } = {...this.props};

    // Display buttons for submitter when status is "submitted"
    let editAnswersButton = null;
    let sendForApprovalButton = null;
    if (viewAs === "submitter") {
      editAnswersButton = (
        <LightButton title="EDIT ANSWERS"
                     iconImage={editIcon}
                     classes={["button"]}
                     disabled={true}
        />
      );

      if (submission.status === "submitted") {
        sendForApprovalButton = (
          <DarkButton title="SEND FOR APPROVAL"
                      classes={["button"]}
                      onClick={handleSubmitButtonClick}
          />
        );
      }
    }

    // Display "APPROVE" and "DENY" for approvers when status is "waiting for approval"
    let approveButton = null;
    let denyButton = null;
    if (viewAs === "approver") {
      approveButton = (
        <DarkButton title="APPROVE"
                    classes={["button"]}
                    onClick={handleApproveButtonClick}
        />
      );
      denyButton = (
        <LightButton title="DENY"
                     classes={["button"]}
                     onClick={handleDenyButtonClick}
        />
      );
    }

    return (
      <div className="buttons">
        <div>
          {editAnswersButton}
          <LightButton title="DOWNLOAD PDF"
                       iconImage={pdfIcon}
                       classes={["button"]}
                       onClick={handlePDFDownloadButtonClick}/>
          {sendForApprovalButton}
        </div>
        <div>
          {approveButton}
          {denyButton}
        </div>
      </div>
    );
  }

  renderApprovals(submission: Submission) {
    // TODO: Refactor - consider using constants instead of string literal
    if (submission.status === "in_progress" || submission.status === "submitted") {
      return null;
    }

    const approvalStatus = submission.approvalStatus;

    return (
      <div className="approvals">
        <h3>Approvals</h3>
        <div>
          <b>Chief Information Security Officer</b>
          &nbsp;-&nbsp;
          {prettifyStatus(approvalStatus.chiefInformationSecurityOfficer)}
        </div>
        <div>
          <b>Business Owner</b>
          &nbsp;-&nbsp;
          {prettifyStatus(approvalStatus.businessOwner)}
        </div>
        <div>
          <b>Security Architect</b>
          &nbsp;-&nbsp;
          {prettifyStatus(approvalStatus.securityArchitect)}
        </div>
      </div>
    );
  }
}

export default Summary;
