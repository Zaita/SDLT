import type {HomeState} from "../store/HomeState";
import {homeState} from "./homeState";
import {failedHomeState, loadedHomeState, loadingHomeState} from "../actions/home";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";

const defaultState: HomeState = {
  title: "",
  subtitle: "",
  pillars: [],
};

test("Loading start should not change state", () => {
  const newState = homeState(defaultState, loadingHomeState());
  expect(newState).toEqual(defaultState);
});

test("Loading fail should not change state", () => {
  const newState = homeState(defaultState, failedHomeState(DEFAULT_NETWORK_ERROR));
  expect(newState).toEqual(defaultState);
});

test("Loading finish should change state", () => {
  const fixture = {
    title: "a",
    subtitle: "b",
    pillars: [1, 2],
  };
  const newState = homeState(defaultState, loadedHomeState(fixture));
  expect(newState).toEqual(fixture);
});
