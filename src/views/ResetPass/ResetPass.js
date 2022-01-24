import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { withTranslation } from "react-i18next";
import RouterLink from '../../router/a';


const ResetPass = inject('router', 'db', 'actions')(observer(class ResetPass extends Component {
  constructor(props) {
    super(props);
    this.state = { filled: null}
  }
  handleResetPass = (e) => {
    e.preventDefault()
    this.props.actions.resetPass()
  }
  handleChange = (e) => {
    let { name, value } = e.target;
    let { resetPassForm } = this.props.actions
    this.props.actions.resetPassForm[name] = value;
    this.setState({ filled: ( resetPassForm.email.length > 5 ) })
  }

  render () {
    let { projectTitle, resetPassForm: { email } } = this.props.actions
    let {t} = this.props;
    return (
      <div className='login-form height100perc'>

        <Grid
          padded
          textAlign='center'
          style={{ height: '100%' }}
          verticalAlign='middle'
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Segment basic>
              <Header as='h2' color='grey' textAlign='center'>
                {projectTitle}
              </Header>
              <Header as='h3' color='grey' textAlign='center'>
                {t("password_reset")}
              </Header>
              <Form size='large' onSubmit={this.handleResetPass}>
                <Segment padded='very' className='no-border raised'>
                  <Form.Input
                    size='huge'
                    name="email"
                    fluid
                    icon='mail'
                    value={email}
                    iconPosition='left'
                    placeholder='E-mail'
                    onChange={this.handleChange}
                  />

                  <Button
                    disabled = {!this.state.filled}
                    fluid size='huge' color='grey'
                    onClick={this.handleResetPass}
                  >
                    {t("send")}
                  </Button>
                </Segment>
              </Form>
              <Message className='squared'>
                {t("already_registered")} <RouterLink to='/login'>{t("come_in")}</RouterLink><br />
                {t("already_have_code")} <RouterLink to="/newpass" >{t("set")}</RouterLink> {t("new_password")}
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}));

export default withTranslation()(ResetPass)
