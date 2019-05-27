// @flow
import React, {Component} from "react";
import Icon from "../../../img/icons/question-editing.svg";


class MySubmissionButton extends Component<Props> {

  static defaultProps = {
    classes: []
  };

  render() {
    const {classes} = {...this.props};

    return (
      <button className={`LogoutButton ${classes.join(" ")}`}
        onClick={() => {
          this.allSubmission();
        }}
      >
        <div>
          <img src={Icon} />
          My Submissions
        </div>
      </button>
    );
  }


  async allSubmission() {
    window.location.href = `#/MySubmissions`;
  }
}

export default MySubmissionButton;
