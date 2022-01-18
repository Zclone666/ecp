import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Slider from "react-slick";

import { Menu, Icon, Segment, List, Divider, Button, Form, Header, Input } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const Profile = inject("router", "db", "actions", "patients")(observer(class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,

      step: null,

      isLoading: false,
      searchQuery: "",
    };
    this.sliderRef = createRef();
  }

  handleChange = (e, { name, value }) => {
    this.props.actions.profile[name] = value;
    if (["firstname", "lastname", "patronymic"].includes(name)) {
      let { firstname, lastname, patronymic } = this.props.actions.profile;
      this.props.actions.profile.fio = `${lastname || ""} ${firstname || ""} ${patronymic || ""}`;
    }
  };

  back = () => {
    this.props.router.push("/");
  };

  componentDidMount() {
    this.props.actions.getProfile();
  }

  render() {
    const { id, fio, firstname, lastname, patronymic, sex, snils, diploms, licenses, emails, phone } =
      this.props.actions.profile;
      const { t } = this.props.actions;
    let email = (emails.length > 0 && emails[0]) || "";

    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: false,
      swipe: false,
      initialSlide: 0,
    };
    return (
      <div className="h100">
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color="red" onClick={this.back}>
          {t("back")}
          </Menu.Item>
          <Menu.Item disabled onClick={this.savePatient}>
          {t("save")}
          </Menu.Item>
        </Menu>

        <div className="scrollwrapper bottomMenu">
          <Segment basic>
            <Form>
              <Form.Group>
                <Form.Field>
                  <Header as="h2" content={fio} subheader={snils} />
                </Form.Field>
              </Form.Group>
              <Divider horizontal fitted />
              <Form.Group widths={2}>
                <Form.Field>
                  <label>{t("first_name")}</label>
                  <Input
                    size="big"
                    name="firstname"
                    value={firstname || ""}
                    placeholder="Иван"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>{t("last_name")}</label>
                  <Input
                    size="big"
                    name="lastname"
                    value={lastname || ""}
                    placeholder="Иванов"
                    onChange={this.handleChange}
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group widths={2}>
                <Form.Field>
                  <label>{t("middle_name")}</label>
                  <Input
                    size="big"
                    name="patronymic"
                    value={patronymic || ""}
                    placeholder="Иванович"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>{t("sex")}</label>
                  <Button.Group size="big" fluid>
                    <Button primary={sex === "male"} onClick={this.handleChange} name="sex" value="male">
                    {t("male")}
                    </Button>
                    <Button primary={sex === "female"} onClick={this.handleChange} name="sex" value="female">
                    {t("female")}
                    </Button>
                  </Button.Group>
                </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Field width={8}>
                  <label>СНИЛС</label>
                  <Input
                    size="big"
                    name="snils"
                    value={snils || ""}
                    placeholder="12345465"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field width={8}>
                  <label>E-mail</label>
                  <Input
                    size="big"
                    name="email"
                    value={email || ""}
                    placeholder="patient@example.ru"
                    onChange={this.handleChange}
                  />
                </Form.Field>
              </Form.Group>
            </Form>
            <Header as="h3" content="Дипломы" />
            {diploms && diploms.length > 0 && (
              <List divided relaxed verticalAlign="middle" size="large">
                {diploms.map((item, i) => {
                  return (
                    <List.Item key={"analog" + i} onClick={() => this.delete("diploms", i)}>
                      <List.Content floated="right">
                        <Button>{t("delete")}</Button>
                      </List.Content>
                      <List.Icon name="id badge" verticalAlign="middle" />
                      <List.Content className="large">
                        <List.Header>{item}</List.Header>
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
            )}
            <Header as="h3" content="Лицензии" />
            {licenses && licenses.length > 0 && (
              <List divided relaxed verticalAlign="middle" size="large">
                {licenses.map((item, i) => {
                  return (
                    <List.Item key={"analog" + i} onClick={() => this.delete("diploms", i)}>
                      <List.Content floated="right">
                        <Button>{t("delete")}</Button>
                      </List.Content>
                      <List.Icon name="file alternate" verticalAlign="middle" />
                      <List.Content className="large">
                        <List.Header>{item}</List.Header>
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
            )}
          </Segment>
        </div>
      </div>
    );
  }
}));

export default withTranslation()(Profile);
