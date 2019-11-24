// @flow
import React, {Component} from "react";

export class SubmissionExpired extends Component {
  render() {
    return (
      <div className="container">
        <div className="alert alert-danger">
          The submission you are attempting to view does not exist or has expired.
          Please follow <a href="/">this link</a> to the homepage where you can create a new submission.
        </div>
      </div>
    );
  }
}
