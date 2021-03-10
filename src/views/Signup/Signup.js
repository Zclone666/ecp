import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import { Button, Form, Grid, Header, Image, Message, Segment, Link } from "semantic-ui-react";

import Search from "../../components/Search";

import RouterLink from "../../router/a";

import _ from "lodash";

@inject("router", "db", "actions", "tools")
@observer
class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirm_password: "",
      checkPass: true,
      filled: false,
      search_clinic: "",
    };
  }
  handleSignup = (e) => {
    e.preventDefault();

    this.props.actions.signin();
  };
  handleCheck = async (e) => {
    let { name, value } = e.target;
    if (name == "email") {
      this.props.actions.checkUserUmkb();
    }
  };
  handleChange = async (e) => {
    let { name, value } = e.target;

    if (name === "confirm_password") {
      await this.setState({ confirm_password: value });
    } else {
      this.props.actions.signinForm[name] = value;
    }

    let filled =
      this.props.actions.signinForm.email &&
      this.props.actions.signinForm.email.length > 5 &&
      this.props.actions.signinForm.password &&
      this.props.actions.signinForm.password.length > 4 &&
      this.props.actions.signinForm.relationCode &&
      this.props.actions.signinForm.relationCode.length > 4 &&
      this.state.confirm_password &&
      this.state.confirm_password.length > 4;
    this.setState({ filled: filled });

    if (filled && (name === "confirm_password" || name === "password")) {
      this.setState({ checkPass: this.props.actions.signinForm.password === this.state.confirm_password });
    }
  };

  handleResultSelect = async (e, { name, result }) => {
    // console.log({ name, result });
    //let newName = name === 'co_disease' ? 'disease' : name
    // this.props.actions.signinForm.relationCode = result.id;
    this.handleChange({ target: { name: "relationCode", value: result.id } });
    this.handleChange({ target: { name: "lpuName", value: result.description } });
    this.setState({ [`search_clinic`]: "" });
  };

  handleResultUnselect = () => {
    this.props.actions.signinForm.relationCode = null;
    this.props.actions.signinForm.lpuName = null;
    this.setState({ filled: false });
  };

  handleSearchChange = (e, { name, value }) => {
    this.setState({ [`search_clinic`]: value });
    if (value.length > 1) {
      this.props.tools.searchReady = false;
      this.props.tools.searchClinic(value);
    }
  };

  get listSearch() {
    let arr = [];
    this.props.tools.searchClinicRows.forEach((item, i) => {
      if (item.name) {
        arr.push({
          id: item.id,
          key: i,
          title: "",
          // title: "Клиника", //item.name,
          // price: moment(item.birthdate, "x").format("DD.MM.YYYY"),
          description: item.name,
        });
      }
    });
    return arr;
  }

  render() {
    let {
      projectTitle,
      signinForm: { isEmailReg, email, password, lastName, firstName, middleName, lpuName, department, relationCode },
    } = this.props.actions;
    let { confirm_password, filled, checkPass, search_clinic } = this.state;
    let canInputPass = email.length > 1 && isEmailReg;
    let { searchReady, searchClinicRows } = this.props.tools;
    // console.log({isEmailReg, email});
    //relationCode
    return (
      <div className="login-form height100perc">
        <Grid padded textAlign="center" style={{ height: "100%" }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 650 }}>
            <Segment basic>
              <Header as="h2" color="grey" textAlign="center">
                {projectTitle}
              </Header>
              <Header as="h3" color="grey" textAlign="center">
                Регистрация
              </Header>
              <Form size="large" onSubmit={this.handleSignup}>
                <Segment padded="very" className="no-border raised">
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="email"
                      fluid
                      icon="mail"
                      value={email}
                      iconPosition="left"
                      placeholder="E-mail"
                      onBlur={this.handleCheck}
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      size="large"
                      name="firstName"
                      fluid
                      icon="user"
                      value={firstName}
                      iconPosition="left"
                      placeholder="Имя"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="middleName"
                      fluid
                      icon="user"
                      value={middleName}
                      iconPosition="left"
                      placeholder="Отчество"
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      size="large"
                      name="lastName"
                      fluid
                      icon="user"
                      value={lastName}
                      iconPosition="left"
                      placeholder="Фамилия"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Field width={16}>
                      <Search
                        fluid
                        size="big"
                        name="clinic"
                        placeholder="Введите наименование вашей клиники"
                        loading={!searchReady}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={_.debounce(this.handleSearchChange, 500, {
                          leading: true,
                        })}
                        results={this.listSearch}
                        value={search_clinic}
                        resultClassName="result-wrapper"
                      />
                    </Form.Field>
                  </Form.Group>
                  {lpuName && lpuName.length > 0 && (
                    <Message onDismiss={this.handleResultUnselect} header="Выбрана клиника" content={lpuName} />
                  )}
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="department"
                      fluid
                      icon="lab"
                      value={department}
                      iconPosition="left"
                      placeholder="Отделение"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="password"
                      fluid
                      disabled={!canInputPass}
                      error={!this.state.checkPass}
                      icon="lock"
                      iconPosition="left"
                      placeholder="Пароль"
                      value={password}
                      type="password"
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      size="large"
                      name="confirm_password"
                      fluid
                      disabled={!canInputPass}
                      error={!this.state.checkPass}
                      icon="lock"
                      iconPosition="left"
                      placeholder="Подтверждение пароля"
                      value={confirm_password}
                      type="password"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Message className="squared" size="tiny" hidden={!!this.state.filled && !!this.state.checkPass}>
                    Пароль должен содержаь не менее пяти символов
                  </Message>
                  <Button
                    disabled={!(this.state.filled && this.state.checkPass)}
                    fluid
                    size="large"
                    color="grey"
                    onClick={this.handleSignup}
                  >
                    Регистрация
                  </Button>
                </Segment>
              </Form>
              <Message className="squared">
                Уже зарегистрированы? <RouterLink to="/login">Войти</RouterLink>
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Signup;
