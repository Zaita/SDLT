// @flow

import type {ComponentSelectionState} from "../store/ComponentSelectionState";
import type {
  AddSelectedComponentAction,
  LoadAvailableComponentsAction,
  RemoveSelectedComponentAction,
  LoadSelectedComponentsAction
} from "../actions/ActionType";
import ActionType from "../actions/ActionType";
import concat from "lodash/concat";
import ComponentSelectionUtil from "../utils/ComponentSelectionUtil";
import type {SetJiraTicketsAction, SetViewModeAction} from "../actions/componentSelection";

const defaultState: ComponentSelectionState = {
  availableComponents: [],
  selectedComponents: [],
  savedComponents: [],
  jiraTickets: [],
  viewMode: "edit"
};

const isComponentExist = ComponentSelectionUtil.isComponentExist;
const isSelectedComponentExist = ComponentSelectionUtil.isSelectedComponentExist;

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
    const id = act.payload.id;
    const productAspect = act.payload.productAspect;

    if (!isSelectedComponentExist(id, productAspect, state.selectedComponents) &&
      isComponentExist(id, state.availableComponents)) {
      const availableComponent = state.availableComponents.filter((component) => component.id === id );
      const seletedComponent = Object.assign({}, availableComponent[0]);
      seletedComponent.productAspect = productAspect;
      return {
        ...state,
        selectedComponents: concat(
          state.selectedComponents,
          seletedComponent
        )
      };
    }
  }

  if (action.type === ActionType.COMPONENT_SELECTION.REMOVE_SELECTED_COMPONENT) {
    const act: RemoveSelectedComponentAction = action;
    const id = act.payload.id;
    const productAspect = act.payload.productAspect;

    if (isSelectedComponentExist(id, productAspect, state.selectedComponents) &&
      isComponentExist(id, state.availableComponents)) {

      return {
        ...state,
        selectedComponents: state.selectedComponents.filter((component) =>
          component.id !== id || component.productAspect !== productAspect
        )
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

  if (action.type === ActionType.COMPONENT_SELECTION.LOAD_SELECTED_COMPONENTS) {
    const act: LoadSelectedComponentsAction = action;
    return {
      ...state,
      selectedComponents: act.payload
    };
  }

  return state;
}
