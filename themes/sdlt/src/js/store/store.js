import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import rootState from "../reducers/rootState";
import {composeWithDevTools} from "redux-devtools-extension";

const middleware = [thunk];

if (process.env.NODE_ENV !== "production") {
  middleware.push(createLogger({diff: true, collapsed: true}));
}

export const store = createStore(
  rootState,
  composeWithDevTools(
    applyMiddleware(...middleware),
  ),
);

export default store;
