// @flow

import React, {Component} from "react";

type Props = {
  title: string,
  disabled: boolean,
  classes: Array<string>,
  onClick: (event: Event) => void
};

class DarkButton extends Component<Props> {

  static defaultProps = {
    title: "",
    disabled: false,
    classes: [],
    onClick: () => {}
  };

  render() {
    const {title, classes, disabled, onClick} = {...this.props};

    return (
      <button className={`DarkButton ${classes.join(" ")}`}
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

export default DarkButton;
