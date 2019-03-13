// @flow

import React, {Component} from "react";

type Props = {
  title: string,
  disabled: boolean,
  classes: Array<string>,
  onClick: (event: Event) => void,
  iconImage?: string
};

class LightButton extends Component<Props> {

  static defaultProps = {
    title: "",
    disabled: false,
    classes: [],
    onClick: () => {},
  };

  render() {
    const {title, classes, disabled, onClick, iconImage} = {...this.props};

    let icon = null;
    if (iconImage) {
      icon = <img src={iconImage}/>;
    }

    return (
      <button className={`LightButton ${classes.join(" ")}`}
              onClick={(event) => {
                if (disabled) {
                  event.preventDefault();
                  return;
                }
                onClick(event);
              }}
      >
          {icon}
          {title}
      </button>
    );
  }
}

export default LightButton;
