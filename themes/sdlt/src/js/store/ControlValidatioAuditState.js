// @flow

import type {ContolValidationAudit} from "../types/Task";

export type ContolValidationAuditState = {
  contolValidationAuditData: ContolValidationAudit | null,
  cvaSelectedComponents: CVASelectedComponents | []
};
