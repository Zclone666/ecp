import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Slider from "react-slick";

import { Menu, Icon, Segment, List, Divider, Button, Form, Header, Input, Checkbox } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const Settings = inject(
  "router",
  "db",
  "actions",
  "patients"
)(
  observer(
    class Settings extends Component {
      constructor(props) {
        super(props);
        this.state = {
          open: false,

          step: null,

          isLoading: false,
          searchQuery: "",

          zhnvlp_fed: null,
          zhnvlp_reg: null,
          protocol: null,
          rf_ban: null,
        };
        this.sliderRef = createRef();
      }

      handleChange = (e, { name }) => {
        // this.props.actions.profile[name] = value;
        // if (["firstname", "lastname", "patronymic"].includes(name)) {
        //   let { firstname, lastname, patronymic } = this.props.actions.profile;
        //   this.props.actions.profile.fio = `${lastname || ""} ${firstname || ""} ${patronymic || ""}`;
        // }
        // console.log({ name, value });
        this.setState({ [name]: !this.state[name] });
      };

      back = () => {
        this.props.router.push("/");
      };
      saveSettings = () => {
        this.back();
      };
      componentDidMount() {
        // this.props.actions.getProfile();
      }

      render() {
        const { zhnvlp_fed, zhnvlp_reg, protocol, rf_ban } = this.state; //this.props.actions.profile.settings || {};
        const { t } = this.props;
        return (
          <div className="h100">
            <Menu className="bottom fixed menu two item huge main">
              <Menu.Item color="red" onClick={this.back}>
              {t("back")}
              </Menu.Item>
              <Menu.Item onClick={this.saveSettings}>{t("save")}</Menu.Item>
            </Menu>

            <div className="scrollwrapper bottomMenu">
              <Segment basic>
                <Form>
                  <Form.Group>
                    <Form.Field>
                      <Header as="h2" content={t("main_menu_settings")} subheader={t("set_output_options")} />
                    </Form.Field>
                  </Form.Group>
                  <Divider horizontal />
                  <Form.Group widths={2}>
                    <Form.Field>
                      <Checkbox
                        onChange={this.handleChange}
                        name="zhnvlp_fed"
                        checked={!!zhnvlp_fed}
                        slider
                        label={t("federal_list")}
                      />
                    </Form.Field>
                    <Form.Field>
                      <Checkbox
                        onChange={this.handleChange}
                        name="zhnvlp_reg"
                        checked={!!zhnvlp_reg}
                        slider
                        label="ЖНВЛП региональный список"
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group widths={2}>
                    <Form.Field>
                      <Checkbox
                        onChange={this.handleChange}
                        name="protocol"
                        checked={!!protocol}
                        slider
                        label={t("protocol")}
                      />
                    </Form.Field>
                    <Form.Field>
                      <Checkbox
                        onChange={this.handleChange}
                        name="rf_ban"
                        checked={!!rf_ban}
                        slider
                        label={t("not_allowed_rf")}
                      />
                    </Form.Field>
                  </Form.Group>
                </Form>
              </Segment>
            </div>
          </div>
        );
      }
    }
  )
);

export default withTranslation()(Settings);
