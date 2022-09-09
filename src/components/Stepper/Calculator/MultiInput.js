import React, { Component, createRef } from "react";

import { Label, Icon, Form, Input, Button, Dropdown } from "semantic-ui-react";

class MultiInput extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeUnit = (item, value) => {};
  handleChangeValue = (item, value) => {};
  render() {
    let { title, items, denominator, currUnit, width } = this.props;

    return (
      <Form.Field width={width}>
        <label>{title}:</label>
        <div className="ui big right labeled input ">
          <div className="multiinput">
            {items.map((item) => {
              return (
                <div className="multiinput-item">
                  <input
                    name={item.id}
                    value={item.value}
                    type="text"
                    onChange={(e, { name, value }) => this.handleChangeValue(item, value)}
                  />
                  {item.arr && item.arr.length > 1 ? (
                    <Dropdown
                      inline
                      name="currUnit"
                      onChange={(e, { name, value }) => this.handleChangeUnit(item, value)}
                      options={item.arr.map((unit) => {
                        return {
                          key: unit.id,
                          value: unit.id,
                          text: unit.shortname || unit.name,
                        };
                      })}
                      value={item.unit}
                    />
                  ) : (
                    <Label>{item.name}</Label>
                  )}
                </div>
              );
            })}
          </div>
          {denominator && <Label>/{denominator}</Label>}
        </div>
      </Form.Field>
    );
  }
}
export default MultiInput;
