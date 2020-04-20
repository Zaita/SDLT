import type {User} from "../../types/User";

export default class PrettifyStatusUtil {
  static prettifyStatus(
    status: string,
    securityArchitectID: string,
    currentUser: User,
    securityArchitectApprover: string,
    CisoApprovalStatus: string,
    businessOwnerApprovalStatus: string
  ) {
    if (status === "awaiting_security_architect_review") {
      return "Waiting for Security Architect Approval - unassigned";
    }

    if (status === "waiting_for_security_architect_approval") {
      if (currentUser.id == securityArchitectID) {
        return "Waiting for Security Architect Approval - assigned to me";
      }

      if (currentUser.id !== securityArchitectID) {
        return "Waiting for Security Architect Approval - " + securityArchitectApprover;
      }
    }

    if (status === "waiting_for_approval") {
      if (CisoApprovalStatus === "pending" && businessOwnerApprovalStatus === "pending") {
        return "Waiting for Approval - Business Owner and Chief Information Security Officer";
      }

      if (CisoApprovalStatus !== "pending" && businessOwnerApprovalStatus === "pending") {
        return "Waiting for Approval - Business Owner";
      }
    }

    if (status === "approved" && CisoApprovalStatus === "pending" && businessOwnerApprovalStatus === "approved") {
      return "Approved - Chief Information Security Officer Approval Pending";
    }

    return status
      .split("_")
      .map((str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      })
      .join(" ");
  }
}
