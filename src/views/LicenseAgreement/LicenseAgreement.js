import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Segment, Header, Menu } from 'semantic-ui-react';

const LicenseAgreement = inject('actions', 'router')(observer(class LicenseAgreement extends Component {
  render() {
    const {
      actions: { buttonTexts },
    } = this.props;

    const texts = buttonTexts ? buttonTexts.text : null;

    return (
      <Segment basic>
        <Header>{texts.agreementheader}</Header>
        <div dangerouslySetInnerHTML={{ __html: texts.agreementboby }} />
        <Menu className="bottom fixed menu one item huge main">
          <Menu.Item onClick={() => this.props.router.push('/')}>Назад</Menu.Item>
        </Menu>
      </Segment>
    );
  }
}));

export default LicenseAgreement;
