// @flow

import type {User} from "../types/User";
import type {TaskSubmission} from "../types/Task";

export type TaskSubmissionState = {
  siteTitle: string,
  currentUser: User | null,
  taskSubmission: TaskSubmission | null,
};
