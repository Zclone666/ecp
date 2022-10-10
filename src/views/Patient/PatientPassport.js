import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import MaskedInput from "react-text-mask";

import {
  // Search,
  Segment,
  Form,
  Input,
} from "semantic-ui-react";
import { withTranslation } from "react-i18next";

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
        const { editForm } = this.props;
        editForm && editForm();
        const { value, name } = e.target;
        // console.log({ e, value, name });
        this.props.actions.patientPassport[name] = value;
      };

      handleChange = (e, { name, value }) => {
        const { editForm } = this.props;
        editForm && editForm();
        if (!name && !value) {
          name = e.target.name;
          value = e.target.value;
        }
        if (name === "medcard_num") {
          this.props.actions.patientPassport["medcard_num"] = { default: value };
          return;
        }

        if (name === "lastname") {
          value = value.replace(/[^\u0400-\u04FF\s\-a-z]/gi, '');
        }

        if (name === "firstname") {
          value = value.replace(/[^\u0400-\u04FF\s\-a-z]/gi, '');
        }

        if (name === "patronymic") {
          value = value.replace(/[^\u0400-\u04FF\s\-a-z]/gi, '');
        }

        this.props.actions.patientPassport[name] = value;
      };

      render() {
        const {
          // name,
          email,
          // miscode,
          // misid,
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
                    placeholder={t("lastname_placeholder")}
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field required>
                  <label>{t("first_name")}</label>
                  <Input
                    size="big"
                    name="firstname"
                    value={firstname || ""}
                    placeholder={t("firstname_placeholder")}
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>{t("middle_name")}</label>
                  <Input
                    size="big"
                    name="patronymic"
                    value={patronymic || ""}
                    placeholder={t("patronymic_placeholder")}
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
