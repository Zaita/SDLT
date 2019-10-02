// @flow

import {ThunkAction} from "redux-thunk";
import uniq from "lodash/uniq";
import type {
  AddSelectedComponentAction,
  LoadAvailableComponentsAction,
  RemoveSelectedComponentAction,
  LoadSelectedComponentsAction
} from "./ActionType";
import ActionType from "./ActionType";
import type {RootState} from "../store/RootState";
import SecurityComponentDataService from "../services/SecurityComponentDataService";
import CSRFTokenService from "../services/CSRFTokenService";
import type {JiraTicket} from "../types/SecurityComponent";
import ErrorUtil from "../utils/ErrorUtil";

export type SetViewModeAction = {
  type: string,
  payload: "edit" | "review"
};

export type SetJiraTicketsAction = {
  type: string,
  payload: Array<JiraTicket>
};

export function loadAvailableComponents(): ThunkAction {
  return async (dispatch) => {
    const availableComponents = await SecurityComponentDataService.loadAvailableComponents();
    const action: LoadAvailableComponentsAction = {
      type: ActionType.COMPONENT_SELECTION.SET_AVAILABLE_COMPONENTS,
      payload: availableComponents
    };

    await dispatch(action);
  };
}

export function addSelectedComponent(id: string, productAspect: string): ThunkAction {
  return async (dispatch) => {
    const action: AddSelectedComponentAction = {
      type: ActionType.COMPONENT_SELECTION.ADD_SELECTED_COMPONENT,
      payload: {"id": id, "productAspect": productAspect}
    };
    await dispatch(action);
  }
}

export function removeSelectedComponent(id: string, productAspect: string): ThunkAction {
  return async (dispatch) => {
    const action: RemoveSelectedComponentAction = {
      type: ActionType.COMPONENT_SELECTION.REMOVE_SELECTED_COMPONENT,
      payload: {"id": id, "productAspect": productAspect}
    };
    await dispatch(action);
  }
}

export function createJIRATickets(jiraKey: string): ThunkAction {
  return async (dispatch, getState) => {
    try {
      if (!jiraKey) {
        throw new Error("Please enter the project key!");
      }

      const rootState: RootState = getState();
      const selectedComponents = rootState.componentSelectionState.selectedComponents;
      if (!selectedComponents) {
        throw new Error("Nothing to create in JIRA!");
      }
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const jiraTickets = await SecurityComponentDataService.createJiraTickets({
        jiraKey,
        componentIDList: uniq(selectedComponents.map((component) => component.id)),
        csrfToken
      });
      await dispatch(setJiraTickets(jiraTickets));
      await dispatch(setViewMode("review"));
    } catch(error) {
      ErrorUtil.displayError(error);
    }
  }
}

export function setViewMode(viewMode: "review" | "edit"): ThunkAction {
  return async (dispatch) => {
    const action: SetViewModeAction = {
      type: ActionType.COMPONENT_SELECTION.SET_VIEW_MODE,
      payload: viewMode
    };
    await dispatch(action);
  };
}

export function setJiraTickets(tickets: Array<JiraTicket>): ThunkAction {
  return async (dispatch) => {
    const action: SetJiraTicketsAction = {
      type: ActionType.COMPONENT_SELECTION.SET_JIRA_TICKETS,
      payload: tickets
    };
    await dispatch(action);
  };
}

export function loadSelectedComponents(taskSubmission): ThunkAction {
  const selectedComponents = taskSubmission.selectedComponents;

  const savedComponent = selectedComponents.map((component) => {
    component.isSaved = true;
    return component;
  });

  return async (dispatch) => {
    const action: LoadSelectedComponentsAction = {
      type: ActionType.COMPONENT_SELECTION.LOAD_SELECTED_COMPONENTS,
      payload: savedComponent
    };
    await dispatch(action);
  };
}
