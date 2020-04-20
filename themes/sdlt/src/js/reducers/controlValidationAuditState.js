// @flow

import type {ControlValidationAuditState} from "../store/ControlValidationAuditState";
import ActionType from "../actions/ActionType";
import ComponentSelectionUtil from "../utils/ComponentSelectionUtil";
import { cloneDeep } from 'lodash';

const defaultStartState: ControlValidationAuditState = {
  controlValidationAuditData: null,
  cvaSelectedComponents: []
};
const isSelectedComponentExist = ComponentSelectionUtil.isSelectedComponentExist;

export function controlValidationAuditState(state: ControlValidationAuditState = defaultStartState, action: *): ControlValidationAuditState {
  if (action.type === ActionType.CVA.LOAD_CONTROL_VALIDATION_AUDIT_SUCCESS) {
    let controlValidationAuditData = action.payload;
    let selectedComponents = [];

    if (controlValidationAuditData) {
      selectedComponents = controlValidationAuditData.selectedComponents;
      delete controlValidationAuditData.selectedComponents;
    }

    return {
      ...state,
      controlValidationAuditData: controlValidationAuditData,
      cvaSelectedComponents: selectedComponents
    };
  }

  if (action.type === ActionType.CVA.UPDATE_CONTROL_VALIDATION_AUDIT_DATA) {
    const selectedOption = action.payload.selectedOption;
    const productAspect = action.payload.productAspect;
    const controlID = action.payload.controlID;
    const componentID = action.payload.componentID;
    const implementationEvidenceUserInput = action.payload.implementationEvidenceUserInput;
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
        control[0].implementationEvidenceUserInput = implementationEvidenceUserInput;
        return {
          ...state,
          cvaSelectedComponents: selectedComponents,
        };
      }
    }
  }

  if (action.type === ActionType.CVA.RE_SYNC_WITH_JIRA_SUCCESS) {
    const newCVATaskData = action.payload;
    return {
      ...state,
      cvaSelectedComponents: newCVATaskData
    };
  }

  if (action.type === ActionType.CVA.EMPTY_CONTROL_VALIDATION_AUDIT_DATA) {
    const controlValidationAuditData = action.payload;

    return {
      ...state,
      controlValidationAuditData: controlValidationAuditData,
      cvaSelectedComponents: []
    };
  }

  return state;
}
