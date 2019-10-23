// @flow
// site wide loading Icon

import { Icon } from 'react-fa';
import React, {Component} from "react";

export class Loading extends Component {
  render() {
    return (
      <div>
        <div className="loading-spinner-page-overlay">
          <div className="loading-spinner">
            <Icon spin name="spinner" /> Loading
          </div>
        </div>
      </div>
    );
  }
}
