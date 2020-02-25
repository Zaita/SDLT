// @flow
// this file is used on Component Selection Task and Control Validation Audit Task
import React, {Component} from "react";

export class SubmissionNotCompleted extends Component {
  render() {
    return (
      <div className="alert alert-warning">
        The submission you are attempting to view has not been completed yet.
      </div>
    );
  }
}
