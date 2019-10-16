import type {SecurityComponent} from "./SecurityComponent";

export type CVATaskSubmission = {
  id: string,
  uuid: string,
  taskName: string,
  productAspects: Array<*>,
  questionnaireSubmissionUUID: string,
  submitterID: string,
  componentTarget: string,
};

export type CVASelectedComponents = {
  id: string,
  name: string,
  selectedComponents: Array<CVAControls>,
  productAspect: string,
};

export type CVAControls = {
  id: string,
  name: string,
  selectedOption: string,
};
