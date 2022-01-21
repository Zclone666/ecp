import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import BirthDate from "../../components/BirthDate";
import Search from "../../components/Search";

import MaskedInput from "react-text-mask";

import {
  Sidebar,
  Menu,
  Icon,
  // Search,
  Segment,
  Message,
  List,
  Feed,
  Button,
  Responsive,
  Grid,
  Form,
  Input,
  Checkbox,
  Header,
  Dropdown,
} from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const PatientPassport = inject(
  "router",
  "diseases",
  "actions"
)(
  observer(
    class PatientPassport extends Component {
      constructor(props) {
        super(props);
        this.state = {};
        //this.contextRef = createRef()
      }

      handleMaskedInputChange = (e) => {
        const { value, name } = e.target;
        // console.log({ e, value, name });
        this.props.actions.patientPassport[name] = value;
      };

      handleChange = (e, { name, value }) => {
        if (!name && !value) {
          let { name, value } = e.target;
        }
        if (name == "medcard_num") {
          this.props.actions.patientPassport["medcard_num"] = { default: value };
          return;
        }
        this.props.actions.patientPassport[name] = value;
      };

      render() {
        const {
          id,
          // name,
          email,
          // miscode,
          // misid,
          fio,
          lastname,
          patronymic,
          firstname,
          snils,
          policy_num,
          medcard_num,
          main_address,
        } = this.props.actions.patientPassport;
        const { t } = this.props.actions;

        return (
          <Segment basic>
            <Form>
              <Form.Group widths={3}>          
                <Form.Field required>
                  <label>{t("last_name")}</label>
                  <Input
                    size="big"
                    name="lastname"
                    value={lastname || ""}
                    placeholder="Иванов"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field required>
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
                  <label>{t("middle_name")}</label>
                  <Input
                    size="big"
                    name="patronymic"
                    value={patronymic || ""}
                    placeholder="Иванович"
                    onChange={this.handleChange}
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group widths={3}>
                <Form.Field>
                  <label>E-mail</label>
                  <Input
                    size="big"
                    name="email"
                    value={email || ""}
                    placeholder="patient@example.ru"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>{t("SNILS")}</label>
                  <Input
                    size="big"
                    children={
                      <MaskedInput
                        name="snils"
                        value={snils || ""}
                        onChange={this.handleMaskedInputChange}
                        mask={[/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, " ", /\d/, /\d/]}
                        placeholder="000-000-000 00"
                      />
                    }
                  />
                </Form.Field>
                <Form.Field>
                  <label>{t("polis_oms")}</label>
                  <Input
                    size="big"
                    children={
                      <MaskedInput
                        name="policy_num"
                        value={policy_num || ""}
                        onChange={this.handleMaskedInputChange}
                        mask={[
                          /\d/,
                          /\d/,
                          /\d/,
                          /\d/,
                          " ",
                          /\d/,
                          /\d/,
                          /\d/,
                          /\d/,
                          " ",
                          /\d/,
                          /\d/,
                          /\d/,
                          /\d/,
                          " ",
                          /\d/,
                          /\d/,
                          /\d/,
                          /\d/,
                        ]}
                        placeholder="0000 0000 0000 0000"
                      />
                    }
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group widths={2}>
                <Form.Field>
                  <label>{t("patient_medical_map_number")}</label>
                  <Input
                    size="big"
                    name="medcard_num"
                    value={medcard_num?.default || ""}
                    placeholder=""
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>{t("residence_address")}</label>
                  <Input
                    size="big"
                    name="main_address"
                    value={main_address || ""}
                    placeholder=""
                    onChange={this.handleChange}
                  />
                </Form.Field>
              </Form.Group>
            </Form>
          </Segment>
        );
      }
    }
  )
);

export default withTranslation()(PatientPassport);
