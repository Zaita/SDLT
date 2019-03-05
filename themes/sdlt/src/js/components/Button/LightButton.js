// @flow

import React, {Component} from "react";

type Props = {
  title: string,
  disabled: boolean,
  classes: Array<string>,
  onClick: (event: Event) => void,
};

class LightButton extends Component<Props> {

  static defaultProps = {
    title: "",
    disabled: false,
    classes: [],
    onClick: () => {},
  };

  render() {
    const {title, classes, disabled, onClick} = {...this.props};

    return (
      <button className={`LightButton ${classes.join(" ")}`}
            onClick={(event) => {
              if(disabled) {
                event.preventDefault();
                return;
              }
              onClick(event);
            }}
      >
        <div className="title">{title}</div>
      </button>
    );
  }
}

export default LightButton;
