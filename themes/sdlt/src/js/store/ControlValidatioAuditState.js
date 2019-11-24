// @flow

import type {ControlValidationAudit} from "../types/Task";

export type ControlValidationAuditState = {
  controlValidationAuditData: ControlValidationAudit | null,
  cvaSelectedComponents: CVASelectedComponents | []
};
