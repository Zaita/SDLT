import type {LoadingState} from "../store/LoadingState";

export default (state: LoadingState = {}, action: any) => {
  const { type } = action;
  const matches = /(.*)\/(REQUEST|SUCCESS|FAILURE)/.exec(type);

  // not a */REQUEST / */SUCCESS /  */FAILURE actions, so we ignore them
  if (!matches) return state;

  const [request, requestName, requestState] = matches;
  return {
    ...state,
    // Store whether a request is happening at the moment or not
    // e.g. will be true when receiving GET_TODOS/REQUEST
    //      and false when receiving GET_TODOS/SUCCESS / GET_TODOS/FAILURE
    [requestName]: requestState === 'REQUEST'
  };
};
