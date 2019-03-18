// @flow

import React, {Component} from "react";
import classNames from "classnames";

type Props = {
  title: string,
  disabled: boolean,
  classes: Array<string>,
  onClick: (event: Event) => void,
  iconImage?: string
};

class BaseButton extends Component<Props> {

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
      <button className={classNames("BaseButton", classes, {"disabled": disabled})}
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

export default BaseButton;
