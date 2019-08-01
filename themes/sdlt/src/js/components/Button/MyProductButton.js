// @flow
import React, {Component} from "react";
import Icon from "../../../img/icons/my-product.svg";

class MyProductButton extends Component<Props> {

  static defaultProps = {
    classes: []
  };

  render() {
    const {classes} = {...this.props};

    return (
      <button className={`HeaderButton ${classes.join(" ")}`}
        onClick={() => {
          this.allSubmission();
        }}
      >
        <div>
          <img src={Icon} />
          My Products
        </div>
      </button>
    );
  }

  async allSubmission() {
    window.location.href = `#/MyProducts`;
  }
}

export default MyProductButton;
