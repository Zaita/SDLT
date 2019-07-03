// @flow

import type {Pillar} from "../types/Pillar";
import type {Task} from "../types/Task";

export type HomeState = {
  title: string,
  subtitle: string,
  pillars: Array<Pillar>,
  tasks: Array<Task>
};
