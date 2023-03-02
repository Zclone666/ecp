import React from "react";
import { Dimmer } from "semantic-ui-react";

export default class Loader extends React.Component {
  render() {
    const open = this.props.open === false ? false : true;
    return (
      <Dimmer active={open} inverted>
        <img src="/logo.svg" className="loader" alt="loading" />
      </Dimmer>
    );
  }
}
