// @flow

import type {FormInput} from "./FormInput";
import type {FormAction} from "./FormAction";

export type FormPage = {
  id: string,
  title: string,
  question: string,
  keyInformation?: Array<string>,
  description: string,
  inputs?: Array<FormInput>,
  actions?: Array<FormAction>
};
