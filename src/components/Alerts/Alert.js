import React from "react";

import { Transition, Message, Button } from "semantic-ui-react";

class AlertItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
  }
  close = () => {
    let { onClose } = this.props;
    this.setState({ open: false }, () => {
      setTimeout(() => {
        onClose();
      }, 1000);
    });
  };
  componentDidMount() {
    let { sticky } = this.props;
    sticky = false;
    if (!sticky) {
      setTimeout(() => {
        this.close();
      }, 7000);
    }
  }
  render() {
    let { code, title, message, level, sticky, button } = this.props;
    let { open } = this.state;
    return (
      <Transition visible={open} animation="scale" duration={1000}>
        <Message
          className="small squared"
          onDismiss={this.close}
          success={level === "success"}
          error={level === "error"}
          info={level === "info"}
          warning={level === "warning"}
        >
          {title && <Message.Header>{title}</Message.Header>}
          <p>{code != 200 ? message.substring(message.indexOf(":") + 1) : message}</p>
          {button && button.text && (
            <Button
              size="small"
              content={button.text}
              onClick={() => {
                button.action();
                if (button.closeByClick) this.close();
              }}
            />
          )}
        </Message>
      </Transition>
    );
  }
}
export default AlertItem;
