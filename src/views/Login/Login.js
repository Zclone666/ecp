import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
  Divider,
  Checkbox,
  Confirm,
  Dropdown,
  Flag,
} from "semantic-ui-react";
import RouterLink from "../../router/a";
import { withTranslation } from "react-i18next";
import { LOGIN } from "../../constants";

const Login = inject(
  "router",
  "actions"
)(
  observer(
    class Login extends Component {
      constructor(props) {
        super(props);
        this.state = {
          authPending: false,
          filled: false,
          filledCode: false,
          showCode: false,
          privateKeyOnly: LOGIN == "privateKeyOnly",
          showPassword: false,
        };
        const autofill = localStorage.getItem("autofill");
        // console.log({ autofill });
        const autofillEmail = localStorage.getItem("autofillEmail");
        const autofillPassword = localStorage.getItem("autofillPassword");

        if (autofill == "yes") {
          this.props.actions.loginForm.email = autofillEmail ? autofillEmail : "";
          this.props.actions.loginForm.password = autofillPassword ? autofillPassword : "";
        }
      }

      changeLang = (lang) => {
        // console.log({ lang });
        this.props.i18n.changeLanguage(lang);
        this.props.actions.setLang(lang);
      };

      handleLogin = async (e) => {
        e && e.preventDefault();
        if (this.state.authPending) return;
        this.setState({ authPending: true });
        let { showCode, privateKeyOnly } = this.state;
        const { t } = this.props.actions;
        if (privateKeyOnly) {
          this.setState({ autofillAsk: false });
          this.props.actions.fakePrivateKeylogin();
        } else if (showCode) {
          await this.props.actions.login();
          this.setState({ autofillAsk: false });
        } else {
          let isOk = await this.props.actions.fakelogin();
          const { password, email } = this.props.actions.loginForm;
          const autofill = localStorage.getItem("autofill");
          // console.log({ autofill });
          if (isOk && autofill != "yes") {
            const autofillAsk = window.confirm(t("remember_your_email_password"));
            if (autofillAsk) {
              localStorage.setItem("autofillEmail", email);
              localStorage.setItem("autofillPassword", password);
              localStorage.setItem("autofill", "yes");
            }
          }
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
        let { filled, filledCode, showCode, showPassword } = this.state;
        let {
          loginForm: { remember, email, password },
          projectTitle,
          t,
          active_language,
        } = this.props.actions;
        return (
          <div className="login-form height100perc">
            <div style={{ position: "absolute", right: 0, top: 0, padding: "15px" }}>
              <Dropdown
                // disabled
                item
                text={
                  active_language == "ru" ? (
                    <>
                      Русский <Flag name="ru" />
                    </>
                  ) : (
                    <>
                      English <Flag name="gb" />
                    </>
                  )
                }
              >
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => this.changeLang("en")}>
                    <Flag name="gb" />
                    English
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => this.changeLang("ru")}>
                    <Flag name="ru" />
                    Русский
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <Grid padded textAlign="center" style={{ height: "100%" }} verticalAlign="middle">
              <Grid.Column style={{ maxWidth: 450 }}>
                <Segment basic>
                  <Header as="h2" color="grey" textAlign="center">
                    {projectTitle}
                  </Header>
                  <Header as="h3" color="grey" textAlign="center">
                    {t("login")}
                  </Header>
                  <Form size="large">
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
                          value={password}
                          icon="lock"
                          iconPosition="left"
                          placeholder={t("password")}
                          type={showPassword ? "text" : "password"}
                          onChange={this.handleChange}
                          action={{
                            icon: showPassword ? "eye slash" : "eye",
                            onClick: () => {
                              this.setState({ showPassword: !showPassword });
                            },
                          }}
                        />
                      )}
                      {(showCode || this.state.privateKeyOnly) && (
                        <Form.Input
                          size="huge"
                          name="privateKey"
                          fluid
                          icon="key"
                          iconPosition="left"
                          placeholder={t("personal_key")}
                          onChange={this.handleChange}
                        />
                      )}
                      {!this.state.privateKeyOnly && (
                        <Form.Field align="left">
                          <Checkbox
                            value="remember"
                            name="remember"
                            checked={remember}
                            label={t("remember_me")}
                            onChange={this.handleChecked}
                          />
                        </Form.Field>
                      )}
                      <Button
                        loading={this.state.authPending}
                        fluid
                        size="huge"
                        color="grey"
                        onClick={this.handleLogin}
                      >
                        {t("login")}
                      </Button>
                    </Segment>
                  </Form>
                  {!this.state.privateKeyOnly && (
                    <Message className="squared">
                      {t("forgot_your_password")}? <RouterLink to="/resetpass">{t("restore")}</RouterLink>. <br />
                      <RouterLink to="/signup">{t("registration")}</RouterLink> {t("in_system")} <br />
                      <RouterLink to="/confirm">{t("confirm")}</RouterLink> E-mail
                    </Message>
                  )}
                </Segment>
              </Grid.Column>
            </Grid>
          </div>
        );
      }
    }
  )
);

export default withTranslation()(Login);
