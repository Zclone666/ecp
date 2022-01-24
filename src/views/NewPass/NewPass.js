import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import { Button, Form, Grid, Header, Image, Message, Segment, Modal, Icon } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import RouterLink from "../../router/a";

const NewPass = inject("router", "actions")(observer(class NewPass extends Component {
  constructor(props) {
    super(props);
    this.state = { filled: null, openResend: false };
  }
  handleNewPass = async (e) => {
    e.preventDefault();
    let res = await this.props.actions.newPass();
    if (!res) {
      this.setOpen(true);
    }
    // console.log({ res });
  };

  handleResetPass = () => {
    this.props.actions.resetPassForm.email = this.props.actions.newPassForm.email;
    this.props.actions.newPassForm.recoveryCode = "";
    this.props.actions.resetPass();
    this.setOpen(false);
  };

  setOpen = (openResend) => {
    this.setState({ openResend });
  };

  handleChange = (e) => {
    let { name, value } = e.target;
    let { newPassForm } = this.props.actions;
    this.props.actions.newPassForm[name] = value;
    this.setState({ filled: newPassForm.email.length > 5 && newPassForm.recoveryCode.length > 5 });
  };
  componentDidMount() {
    let { code, email, service } = this.props.router.values;
    // console.log({ code, email, service });
    this.handleChange({ target: { name: "recoveryCode", value: code || "" } });
    this.handleChange({ target: { name: "email", value: email || "" } });
    this.props.actions.newPassForm.service = service;
  }

  render() {
    let {
      projectTitle,
      newPassForm: { recoveryCode, email, newPassword },
    } = this.props.actions;
    let {t} = this.props;
    let { openResend } = this.state;
    return (
      <div className="login-form height100perc">
        <Grid padded textAlign="center" style={{ height: "100%" }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Segment basic>
              <Header as="h2" color="grey" textAlign="center">
                {projectTitle}
              </Header>
              <Header as="h3" color="grey" textAlign="center">
                {t("set")+" "+t("new_password")}
                {/* ЗАДАТЬ НОВЫЙ ПАРОЛЬ */}
              </Header>
              <Form size="large" onSubmit={this.handleNewPass}>
                <Segment padded="very" className="no-border raised">
                  <Form.Input
                    size="huge"
                    name="email"
                    fluid
                    icon="mail"
                    value={email}
                    iconPosition="left"
                    placeholder="E-mail"
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    size="huge"
                    name="recoveryCode"
                    fluid
                    icon="lock"
                    value={recoveryCode || ""}
                    iconPosition="left"
                    placeholder={t("confirmation_code")}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    size="huge"
                    name="newPassword"
                    fluid
                    icon="key"
                    iconPosition="left"
                    placeholder={t("enter_new_password")}
                    type="password"
                    onChange={this.handleChange}
                  />
                  <Button disabled={!this.state.filled} fluid size="huge" color="grey" onClick={this.handleNewPass}>
                  {t("confirm")}
                  </Button>
                </Segment>
              </Form>
              <Message className="squared">
              {t("already_registered")} <RouterLink to="/login">{t("come_in")}</RouterLink>
                <br />
                {t("or")} <RouterLink to="/resetpass">{t("send")}</RouterLink> {t("re_code_confirmation")}
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
        <Modal closeIcon open={openResend} onClose={() => this.setOpen(false)} onOpen={() => this.setOpen(true)}>
          <Header content={t("code_invalid")} />
          <Modal.Content>
            <p>{t("code_for_changing_password_invalid")}</p>
            <p>{t("change_password_must_send_new_confirmation_code")}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color="red" onClick={() => this.setOpen(false)}>
              <Icon name="remove" /> {t("main_parser_cancel")}
            </Button>
            <Button color="green" onClick={() => this.handleResetPass()}>
              <Icon name="checkmark" /> {t("send_mail")}
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}));

export default withTranslation()(NewPass);
