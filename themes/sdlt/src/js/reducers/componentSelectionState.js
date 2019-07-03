// @flow

import type {ComponentSelectionState} from "../store/ComponentSelectionState";
import type {
  AddSelectedComponentAction,
  LoadAvailableComponentsAction,
  RemoveSelectedComponentAction
} from "../actions/ActionType";
import ActionType from "../actions/ActionType";
import concat from "lodash/concat";
import ComponentSelectionUtil from "../utils/ComponentSelectionUtil";
import type {SetJiraTicketsAction, SetViewModeAction} from "../actions/componentSelection";

const defaultState: ComponentSelectionState = {
  availableComponents: [],
  selectedComponents: [],
  jiraTickets: [],
  viewMode: "edit"
};

const isComponentExists = ComponentSelectionUtil.isComponentExists;

export function componentSelectionState(state: ComponentSelectionState = defaultState, action: *) {
  if (action.type === ActionType.COMPONENT_SELECTION.SET_AVAILABLE_COMPONENTS) {
    const act: LoadAvailableComponentsAction = action;
    return {
      ...state,
      availableComponents: act.payload
    };
  }

  if (action.type === ActionType.COMPONENT_SELECTION.ADD_SELECTED_COMPONENT) {
    const act: AddSelectedComponentAction = action;
    if (!isComponentExists(act.payload, state.selectedComponents) &&
      isComponentExists(act.payload, state.availableComponents)) {
      return {
        ...state,
        selectedComponents: concat(
          state.selectedComponents,
          state.availableComponents.filter((component) => component.id === act.payload)
        )
      };
    }
  }

  if (action.type === ActionType.COMPONENT_SELECTION.REMOVE_SELECTED_COMPONENT) {
    const act: RemoveSelectedComponentAction = action;
    if (isComponentExists(act.payload, state.selectedComponents) &&
      isComponentExists(act.payload, state.availableComponents)) {
      return {
        ...state,
        selectedComponents: state.selectedComponents.filter((component) => component.id !== act.payload)
      };
    }
  }

  if (action.type === ActionType.COMPONENT_SELECTION.SET_JIRA_TICKETS) {
    const act: SetJiraTicketsAction = action;
    return {
      ...state,
      jiraTickets: act.payload
    };
  }

  if (action.type === ActionType.COMPONENT_SELECTION.SET_VIEW_MODE) {
    const act: SetViewModeAction = action;
    return {
      ...state,
      viewMode: act.payload
    };
  }

  return state;
}