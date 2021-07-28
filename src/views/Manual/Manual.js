import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Segment, Header, Menu } from 'semantic-ui-react';

@inject('actions', 'router')
@observer
class Manual extends Component {
  render() {
    const {
      actions: { buttonTexts },
    } = this.props;

    const texts = buttonTexts ? buttonTexts.text : null;

    return (
      <Segment basic>
        <Header>{texts.manualheader}</Header>
        <div dangerouslySetInnerHTML={{ __html: texts.manualboby }} />
        <Menu className="bottom fixed menu one item huge main">
          <Menu.Item onClick={() => this.props.router.push('/')}>Назад</Menu.Item>
        </Menu>
      </Segment>
    );
  }
}

export default Manual;
