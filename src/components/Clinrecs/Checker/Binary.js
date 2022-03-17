import React from "react";
import { Checkbox, List, Button, Icon, Popup } from "semantic-ui-react";

export default class Binary extends React.Component {
  handleChange = (e, { name, value }) => {
    let { onChange } = this.props;
    if (!name) {
      let { name } = e.target;
    }
    if (!value || typeof value === "undefined") {
      value = this.props.value;
    }
    // console.log({ value });
    onChange({ name, value: !!value ? 0 : 1 });
  };
  render() {
    let { title, name, value, buttons, helper, radio } = this.props;
    return (
      <List.Item style={{ position: "relative" }}>
        {helper && (
          <Popup
            position="bottom right"
            content={helper}
            trigger={<Icon style={{ position: "absolute", right: "10px" }} name="question circle" />}
          />
        )}
        {buttons && (
          <>
            <Button.Group icon>
              <Button
                color={value === 1 ? "blue" : "grey"}
                name={name}
                onClick={() => this.handleChange({ name, value: 1 })}
                active={value === 1}
              >
                <Icon name="check" />
              </Button>
              <Button
                color={value === 0 ? "red" : "grey"}
                name={name}
                onClick={() => this.handleChange({ name, value: 0 })}
                active={value === 0}
              >
                <Icon name="delete" />
              </Button>
            </Button.Group>
            <label>{title}</label>
          </>
        )}
        {!buttons && (
          <Checkbox radio={radio} checked={!!value} onChange={this.handleChange} name={name} label={title} />
        )}
      </List.Item>
    );
  }
}
