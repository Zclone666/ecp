import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import { Button, Form, Grid, Header, Image, Message, Segment, Divider, Checkbox } from "semantic-ui-react";
import RouterLink from "../../router/a";

import { LOGIN } from "../../constants";

@inject("router", "actions")
@observer
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authPending: false,
      filled: false,
      filledCode: false,
      showCode: false,
      privateKeyOnly: LOGIN == "privateKeyOnly",
    };
  }
  handleLogin = async (e) => {
    e.preventDefault();
    if (this.state.authPending) return;
    this.setState({ authPending: true });
    let { showCode, privateKeyOnly } = this.state;
    if (privateKeyOnly) {
      this.props.actions.fakePrivateKeylogin();
    } else if (showCode) {
      await this.props.actions.login();
    } else {
      let isOk = await this.props.actions.fakelogin();
      // console.log(isOk);
      // if( isOk ) this.setState({ showCode: true })
    }
    this.setState({ authPending: false });
  };
  checkFilled = () => {
    let { loginForm } = this.props.actions;
    let filled = loginForm.email.length > 3 && loginForm.password.length > 3;
    let filledCode = filled && loginForm.privateKey.length > 3;

    this.setState({ filled, filledCode });
  };
  handleChange = (e) => {
    let { name, value } = e.target;
    this.props.actions.loginForm[name] = value;
    this.checkFilled();
  };
  handleChecked = (e, { name, checked }) => {
    this.props.actions.loginForm[name] = checked;
    this.checkFilled();
  };
  render() {
    let { filled, filledCode, showCode } = this.state;
    let {
      loginForm: { remember, email },
      projectTitle,
    } = this.props.actions;
    return (
      <div className="login-form height100perc">
        <Grid padded textAlign="center" style={{ height: "100%" }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Segment basic>
              <Header as="h2" color="grey" textAlign="center">
                {projectTitle}
              </Header>
              <Header as="h3" color="grey" textAlign="center">
                Вход в систему
              </Header>
              <Form size="large" onSubmit={this.handleLogin}>
                <Segment padded="very" className="no-border raised">
                  {!this.state.privateKeyOnly && (
                    <Form.Input
                      size="huge"
                      name="email"
                      fluid
                      icon="user"
                      value={email}
                      iconPosition="left"
                      placeholder="E-mail address"
                      onChange={this.handleChange}
                    />
                  )}
                  {!this.state.privateKeyOnly && (
                    <Form.Input
                      size="huge"
                      name="password"
                      fluid
                      icon="lock"
                      iconPosition="left"
                      placeholder="Пароль"
                      type="password"
                      onChange={this.handleChange}
                    />
                  )}
                  {(showCode || this.state.privateKeyOnly) && (
                    <Form.Input
                      size="huge"
                      name="privateKey"
                      fluid
                      icon="key"
                      iconPosition="left"
                      placeholder="Персональный ключ"
                      onChange={this.handleChange}
                    />
                  )}
                  {!this.state.privateKeyOnly && (
                    <Form.Field align="left">
                      <Checkbox
                        value="remember"
                        name="remember"
                        checked={remember}
                        label="Запомнить меня"
                        onChange={this.handleChecked}
                      />
                    </Form.Field>
                  )}
                  <Button loading={this.state.authPending} fluid size="huge" color="grey" onClick={this.handleLogin}>
                    Вход
                  </Button>
                </Segment>
              </Form>
              {!this.state.privateKeyOnly && (
                <Message className="squared">
                  Забыли пароль? <RouterLink to="/resetpass">Восстановить</RouterLink>. <br />
                  <RouterLink to="/signup">Регистрация</RouterLink> в системе <br />
                  <RouterLink to="/confirm">Подтвердить</RouterLink> E-mail
                </Message>
              )}
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
export default Login;
