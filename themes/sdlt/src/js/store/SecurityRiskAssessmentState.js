// @flow

import type {SecurityRiskAssessment} from "../types/Task";
import type {ImapctThreshold} from "../types/ImapctThreshold";

export type SecurityRiskAssessmentState = {
  securityRiskAssessmentData: SecurityRiskAssessment | null,
  impactThresholdData: ImapctThreshold | null
};
