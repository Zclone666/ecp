import React from "react";
import { inject, observer } from "mobx-react";
import { List, Form, Input, Dropdown, Select } from "semantic-ui-react";

const Value = inject("tools")(
  observer(
    class Value extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          currUnit: null,
        };
      }
      handleChange = (e, { name, value }) => {
        let { onChange } = this.props;
        if (!name && !value) {
          let { name, value } = e.target;
        }
        if (value === "" || value === 0 || value === "0" || value === "." || value.split(".")[1] === "") {
          onChange({ name, value: value });
        } else {
          onChange({ name, value: parseFloat(value) });
        }
      };
      handleChangeUnit = (e, { value: unitid }) => {
        let { currUnit } = this.state;
        let { name, value, onChange } = this.props;
        let { getFromBase, getToBase } = this.props.tools;
        if (!name && !value) {
          let { name, value } = e.target;
        }
        // console.log({ unitid });
        //
        let baseValue = 0;
        let resValue = "";
        if (value) {
          baseValue = getToBase(currUnit, value);
          resValue = getFromBase(unitid, baseValue, unitid == 78 ? 2 : 0)[0].toString();
        }

        onChange({ name, value: resValue, unitid });

        this.setState({ currUnit: unitid });
      };
      componentDidMount() {
        let { unitid } = this.props;
        this.setState({ currUnit: unitid });
      }
      render() {
        let { title, name, value, unit, unitid, tools } = this.props;
        let { currUnit } = this.state;

        let times = [
          {
            key: 77,
            value: 77,
            text: ``,
          },
          {
            key: 78,
            value: 78,
            text: ``,
          },
          {
            key: 344,
            value: 344,
            text: ``,
          },
          {
            key: 345,
            value: 345,
            text: ``,
          },
        ];
        times.forEach((tItem, i) => {
          if (tools.shortnames[tItem.key]) times[i].text = tools.shortnames[tItem.key];
        });

        // console.log({ currUnit, unitid, unit });
        return (
          <List.Item>
            <Form>
              <Form.Field>
                <label>{title}</label>
                {unit ? (
                  <Input
                    label={
                      unitid == 78 ? (
                        <Select
                          basic
                          compact
                          direction="left"
                          name="currUnit"
                          onChange={this.handleChangeUnit}
                          options={times}
                          value={currUnit || unitid}
                        />
                      ) : (
                        { basic: true, content: unit }
                      )
                    }
                    labelPosition="right"
                    name={name}
                    onChange={this.handleChange}
                    placeholder={title}
                    value={value}
                  />
                ) : (
                  <Input name={name} onChange={this.handleChange} placeholder={title} value={value} />
                )}
              </Form.Field>
            </Form>
          </List.Item>
        );
      }
    }
  )
);
export default Value;
