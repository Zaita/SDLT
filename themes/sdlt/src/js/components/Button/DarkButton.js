// @flow

import React, {Component} from "react";
import BaseButton from "./BaseButton";

type Props = {
  title: string,
  disabled: boolean,
  classes: Array<string>,
  onClick: (event: Event) => void,
  iconImage?: string
};

class DarkButton extends Component<Props> {

  static defaultProps = {
    title: "",
    disabled: false,
    classes: [],
    onClick: () => {}
  };

  render() {
    return <BaseButton {...this.props} classes={["DarkButton", ...this.props.classes]} />;
  }
}

export default DarkButton;
