// @flow

import React, {Component} from "react";
import type {Submission} from "../../types/Questionnaire";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import pdfIcon from "../../../img/icons/pdf.svg";
import editIcon from "../../../img/icons/edit.svg";
import _ from "lodash";
import URLUtil from "../../utils/URLUtil";
import SubmissionDataUtil from "../../utils/SubmissionDataUtil";

type Props = {
  submission: Submission | null,
  handlePDFDownloadButtonClick: () => void,
  handleSubmitButtonClick: () => void,
  handleAssignToMeButtonClick: () => void,
  handleApproveButtonClick: () => void,
  handleDenyButtonClick: () => void,
  handleEditButtonClick: () => void,
  viewAs: "submitter" | "approver" | "others",
  token: string,
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

  static defaultProps = {
    submission: null,
    handlePDFDownloadButtonClick: () => {},
    handleSubmitButtonClick: () => {},
    handleApproveButtonClick: () => {},
    handleDenyButtonClick: () => {},
    handleEditButtonClick: () => {},
    handleAssignToMeButtonClick: () => {},
    viewAs: "others",
    token: "",
  };

  render() {
    const {submission, viewAs} = {...this.props};

    if (!submission) {
      return null;
    }

    if (submission.status === "in_progress" && viewAs === "submitter") {
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
        {this.renderTasks(submission)}
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
        <div><b>Email:</b> {submitter.email}</div>
        <div><b>Status:</b> {prettifyStatus(submission.status)}</div>
      </div>
    );
  }

  renderTasks(submission: Submission) {
    const taskSubmissions = submission.taskSubmissions;
    if (taskSubmissions.length === 0) {
      return null;
    }

    return (
      <div className="tasks">
        <h3>Tasks</h3>
        {taskSubmissions.map(({uuid, taskName, taskType, status}) => {
          const {token} = {...this.props};
          return (
            <div key={uuid}>
              <button className={"btn btn-link"} onClick={(event: Event) => {
                if (taskType === "selection") {
                  URLUtil.redirectToComponentSelectionSubmission(uuid, token);
                  return;
                }
                URLUtil.redirectToTaskSubmission(uuid, token);
              }}>
                {taskName} ({prettifyStatus(status)})
              </button>
            </div>
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
      handleAssignToMeButtonClick,
      handleDenyButtonClick,
      handleEditButtonClick
    } = {...this.props};

    const downloadPDFButton = (
      <LightButton title="DOWNLOAD PDF OF ANSWERS"
                   iconImage={pdfIcon}
                   classes={["button"]}
                   onClick={handlePDFDownloadButtonClick}/>
    );

    // Display buttons for submitter
    if (viewAs === "submitter") {
      // Render edit answers button for submitter in all cases
      const editAnswersButton = (
        <LightButton title="EDIT ANSWERS"
                     iconImage={editIcon}
                     classes={["button"]}
                     onClick={handleEditButtonClick}
        />
      );

      // Render send for approval button for submitter only in specific submission status
      const sendForApprovalButton = (
        <DarkButton title="SEND FOR APPROVAL"
                    classes={["button"]}
                    disabled={SubmissionDataUtil.existsIncompleteTaskSubmission(submission.taskSubmissions)}
                    onClick={handleSubmitButtonClick}
        />
      );

      if (submission.status === "submitted") {
        return (
          <div className="buttons">
            <div>
              {editAnswersButton}
              {downloadPDFButton}
              {sendForApprovalButton}
            </div>
            <div/>
          </div>
        );
      }

      if (submission.status === "waiting_for_security_architect_approval") {
        return (
          <div className="buttons">
            <div>
              {editAnswersButton}
              {downloadPDFButton}
            </div>
            <div/>
          </div>
        );
      }

      return (
        <div className="buttons">
          <div>
            {downloadPDFButton}
          </div>
          <div/>
        </div>
      );
    }

    // Display buttons for approvers
    if (viewAs === "approver" || viewAs === "businessOwnerApprover") {
      const assignToMeButton = (
        <LightButton title="Assign to Me"
                    classes={["button"]}
                    onClick={handleAssignToMeButtonClick}
        />
      );
      const approveButton = (
        <DarkButton title="APPROVE"
                    classes={["button"]}
                    onClick={handleApproveButtonClick}
        />
      );
      const denyButton = (
        <LightButton title="DENY"
                     classes={["button"]}
                     onClick={handleDenyButtonClick}
        />
      );

      if (submission.status === "submitted") {
        return (
          <div className="buttons">
            <div>
              {downloadPDFButton}
            </div>
            <div/>
          </div>
        );
      }

      if (submission.status === "assign_to_security_architect") {
        return (
          <div className="buttons">
            <div>
              {downloadPDFButton}
              {assignToMeButton}
            </div>
            <div/>
          </div>
        );
      }

      return (
        <div className="buttons">
          <div>
            {downloadPDFButton}
          </div>
          <div>
            {approveButton}
            {denyButton}
          </div>
        </div>
      );
    }

    // Display buttons for others (either a submitter not an approver)
    return (
      <div className="buttons">
        <div>
          {downloadPDFButton}
        </div>
        <div/>
      </div>
    );
  }

  renderApprovals(submission: Submission) {
    // TODO: Refactor - consider using constants instead of string literal
    if (submission.status === "in_progress" ||
      submission.status === "submitted"
    ) {
      return null;
    }

    const approvalStatus = submission.approvalStatus;
    const securityArchitectApprover = submission.securityArchitectApprover;
    const cisoApprover = submission.cisoApprover;

    let securityArchitectApprovalStatus = prettifyStatus(approvalStatus.securityArchitect);
    let cisoApprovalStatus = prettifyStatus(approvalStatus.chiefInformationSecurityOfficer);

    if (securityArchitectApprovalStatus == "Approved") {
      securityArchitectApprovalStatus = securityArchitectApprover.FirstName + " " +
        securityArchitectApprover.Surname + " - " + securityArchitectApprovalStatus;
    }

    if (submission.status === "waiting_for_security_architect_approval") {
      securityArchitectApprovalStatus = "Being Reviewed by " + securityArchitectApprover.FirstName + " " +
        securityArchitectApprover.Surname;
    }

    if (cisoApprovalStatus !== "Pending") {
      cisoApprovalStatus = cisoApprover.FirstName + " " + cisoApprover.Surname + " - " + cisoApprovalStatus;
    }

    let businessOwnerApprovalStatus = prettifyStatus(approvalStatus.businessOwner)
    if (businessOwnerApprovalStatus !== "Pending") {
        businessOwnerApprovalStatus = submission.businessOwnerApproverName + " - " + businessOwnerApprovalStatus;
    }
    return (
      <div className="approvals">
        <h3>Approvals</h3>
        <div>
          <b>Security Architect</b>
          &nbsp;-&nbsp;
          {securityArchitectApprovalStatus}
        </div>
        <div>
          <b>Chief Information Security Officer</b>
          &nbsp;-&nbsp;
          {cisoApprovalStatus}
        </div>
        <div>
          <b>Business Owner</b>
          &nbsp;-&nbsp;
          {businessOwnerApprovalStatus}
        </div>
      </div>
    );
  }
}

export default Summary;
