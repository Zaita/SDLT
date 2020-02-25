// @flow

import type {SecurityRiskAssessment} from "../types/Task";
import type {ImpactThreshold} from "../types/ImpactThreshold";

export type SecurityRiskAssessmentState = {
  securityRiskAssessmentData: SecurityRiskAssessment | null,
  impactThresholdData: ImpactThreshold | null
};
