import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Segment, Header, Menu, Container } from 'semantic-ui-react';

const LicenseAgreement = inject('actions', 'router')(observer(class LicenseAgreement extends Component {
  render() {
    const {
      actions: { buttonTexts },
    } = this.props;

    const texts = buttonTexts ? buttonTexts.text : null;

    return (
      <Container text style={{padding: "1em 0em"}}>

      <Segment style={{padding: "3em 1em"}}>

        <Header style={{textAlign: "center"}}>{texts.agreementheader}</Header>
        <div dangerouslySetInnerHTML={{ __html: texts.agreementboby }} />
        
      </Segment>
      <Menu className="bottom fixed menu one item huge main">
          <Menu.Item onClick={() => this.props.router.push('/')}>Назад</Menu.Item>
        </Menu>
      </Container>      
    );
  }
}));

export default LicenseAgreement;
