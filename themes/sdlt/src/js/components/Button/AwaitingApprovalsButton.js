// @flow
import React, {Component} from "react";
import Icon from "../../../img/icons/approval.svg";

class AwaitingApprovalsButton extends Component<Props> {

  static defaultProps = {
    classes: []
  };

  render() {
    const {classes} = {...this.props};

    return (
      <button className={`HeaderButton ${classes.join(" ")}`}
        onClick={() => {
          this.awaitingApprovals();
        }}
      >
        <div>
          <img src={Icon} />
            Awaiting Approvals
        </div>
      </button>
    );
  }

  async awaitingApprovals() {
    window.location.href = `#/AwaitingApprovals`;
  }
}

export default AwaitingApprovalsButton;
