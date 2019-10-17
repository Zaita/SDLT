// @flow

import React, {Component} from "react";

type Props = {
  footerCopyrightText: string;
};

class Footer extends Component<Props> {
  static defaultProps = {
    footerCopyrightText: "",
  };

  render() {
    const {footerCopyrightText} = {...this.props};
    return (
      <footer className="Footer">
        <div>
        {footerCopyrightText}
        </div>
      </footer>
    );
  }
}

export default Footer;
