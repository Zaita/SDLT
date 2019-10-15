// @flow

import type {ContolValidationAuditState} from "../store/ContolValidationAuditState";
import ActionType from "../actions/ActionType";
import ComponentSelectionUtil from "../utils/ComponentSelectionUtil";
import { cloneDeep } from 'lodash';

const defaultStartState: ContolValidationAuditState = {
  contolValidationAuditData: null,
  cvaSelectedComponents: []
};
const isSelectedComponentExist = ComponentSelectionUtil.isSelectedComponentExist;

export function controlValidationAuditState(state: ContolValidationAuditState = defaultStartState, action: *): ContolValidationAuditState {
  if (action.type === ActionType.CVA.LOAD_CONTROL_VALIDATION_AUDIT) {
    let contolValidationAuditData = action.payload;
    let selectedComponents = [];

    if (contolValidationAuditData) {
      selectedComponents = contolValidationAuditData.selectedComponents;
      delete contolValidationAuditData.selectedComponents;
    }

    return {
      ...state,
      contolValidationAuditData: contolValidationAuditData,
      cvaSelectedComponents: selectedComponents
    };
  }

  if (action.type === ActionType.CVA.UPDATE_CONTROL_VALIDATION_AUDIT_DATA) {
    const selectedOption = action.payload.selectedOption;
    const productAspect = action.payload.productAspect;
    const controlID = action.payload.controlID;
    const componentID = action.payload.componentID;
    const selectedComponents = cloneDeep(state.cvaSelectedComponents);
    let selectedcomponent = [];
    if (productAspect !== "") {
      selectedcomponent = selectedComponents.filter((component) => component.id == componentID && component.productAspect == productAspect);
    } else {
      selectedcomponent = selectedComponents.filter((component) => component.id == componentID)
    }

    if(selectedcomponent.length> 0) {
      const control = selectedcomponent[0].controls.filter((control) => control.id == controlID);
      if(control.length> 0) {
        control[0].selectedOption = selectedOption;
        return {
          ...state,
          cvaSelectedComponents: selectedComponents,
        };
      }
    }
  }

  if (action.type === ActionType.CVA.RE_SYNC_WITH_JIRA) {
    const newCVATaskData = action.payload;
    return {
      ...state,
      cvaSelectedComponents: newCVATaskData
    };
  }

  return state;
}
