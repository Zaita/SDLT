// @flow
// This is used for component selection

import React, {Component} from "react";
import LeftBarItem from "../LeftBar/LeftBarItem";
import type {SecurityComponent} from "../../types/SecurityComponent";
import ComponentSelectionUtil from "../../utils/ComponentSelectionUtil";
import toString from "lodash/toString";

type Props = {
  availableComponents: Array<SecurityComponent>,
  selectedComponents: Array<SecurityComponent>,
  removeComponent: (id: string) => void,
  addComponent: (id: string) => void,
  title: string,
  componentTarget: string,
};

type State = {
  filter: string,
  selectedProductAspect: string,
};

export default class LeftBar extends Component<Props> {
  constructor(props: *) {
    super(props);
    this.state = {
      filter: "",
      selectedProductAspect: props.productAspects && props.productAspects.length ? props.productAspects[0] : ''
    };
  }
  handleChange(event) {
    alert(event.target.value);
  }
  render() {
    const {
      title,
      availableComponents,
      selectedComponents,
      removeComponent,
      addComponent,
      productAspects,
      componentTarget
    } = {...this.props};

    const {filter, selectedProductAspect} = {...this.state};

    return (
      <div className="LeftBar">
        {productAspects && productAspects.length > 0 && (
          <div className="product-aspect">
            <label>
              <span className="product-aspect-label">Please select a Product Aspect:</span>
              <select
                className="custom-select custom-select-sm"
                onChange={(event) => {
                  const value = toString(event.target.value).trim();
                  this.setState({selectedProductAspect: value});
                }}
                value={selectedProductAspect}>
                {
                  productAspects.map((productAspect, index) => {
                    return <option key={index} value={productAspect}>{productAspect}</option>;
                  })
                }
              </select>
            </label>
          </div>
        )}

        <div className="title">{title}</div>
        <div className="search">
          <i className="fas fa-search"/>
          <input type="text" placeholder="Filter component..." onChange={(event) => {
            const value = toString(event.target.value).trim();
            this.setState({filter: value});
          }}/>
        </div>
        <div className="items">
          {availableComponents
            .filter((component) => {
              if (!filter) {
                return true;
              }
              return component.name.includes(filter);
            })
            .map((component) => {
              const isSelected = ComponentSelectionUtil.isSelectedComponentExist(component.id, selectedProductAspect, selectedComponents);
              const isDisable = ComponentSelectionUtil.isComponentSaved(component.id, selectedProductAspect, selectedComponents, componentTarget)
                && componentTarget == "JIRA Cloud";

              return (
                <LeftBarItem
                  title={component.name}
                  iconType={isSelected ? "success" : "pending"}
                  disabled={isDisable}
                  key={component.id}
                  onItemClick={() => {
                    // Toggle selection
                    if (isSelected) {
                      removeComponent(component.id, selectedProductAspect);
                    } else {
                      addComponent(component.id, selectedProductAspect);
                    }
                  }}/>
              );
            })}
        </div>
      </div>
    );
  }
}
