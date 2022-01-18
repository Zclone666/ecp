import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Slider from "react-slick";

import PatientForm from "./PatientForm";
import PatientPassport from "./PatientPassport";

import Search from "../../components/Search";

import { Segment, List, Button, Form, Input, Icon, Header } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import moment from "moment";

const PatientsList = inject(
  "router",
  "db",
  "actions",
  "patients"
)(
  observer(
    class PatientsList extends Component {
      constructor(props) {
        super(props);
        this.state = {
          open: false,

          step: 0,

          isLoading: false,
          search_patient: "",
        };
        this.sliderRef = createRef();
      }

      back = () => {
        this.props.router.push("/");
      };
      chose = async (id) => {
        // this.props.actions.loading = true
        this.props.patients.request(id);
        this.props.router.push("/patient/info");
        // this.props.actions.loading = false
      };
      // get list() {
      //   let arr = [];
      //   this.props.patients.patient.forEach((item, i) => {
      //     arr.push(item);
      //   });
      //   return arr;
      // }

      clearPatient = () => {
        this.props.patients.unsetCurrent();
        this.props.actions.resetAll();
      };

      handleResultSelect = async (e, { name, result }) => {
        //let newName = name === 'co_disease' ? 'disease' : name
        await this.props.patients.request(result.id);
        this.setState({ [`search_${name}`]: "" });
      };

      handleSearchChange = (e, { name, value }) => {
        this.setState({ [`search_${name}`]: value });
        if (value.length > 1) {
          this.props.patients.searchReady = false;
          this.props.patients.search(value);
        }
      };

      get listSearch() {
        let arr = [];
        this.props.patients.searchRows.forEach((item, i) => {
          if (item.name) {
            arr.push({
              id: item.id,
              title: item.name,
              price: item.birthdate ? moment(item.birthdate, "x").format("DD.MM.YYYY") : "",
              description: item.email,
            });
          }
        });
        return arr;
      }

      get last() {
        let arr = [];
        this.props.patients.last.forEach((item, i) => {
          arr.push(item);
        });

        return _.orderBy(arr, ["date"], ["desc"]);
      }

      render() {
        let {
          patients,
          patients: {
            searchReady,
            searchRows,
            current: { id, email, fio },
          },
          // actions: {
          //   patientPassport: { id, email, fio },
          // },
        } = this.props;
        const { t } = this.props.actions;
        let { search_patient } = this.state;
        return (
          <Segment basic>
            <Form>
              <Form.Group widths={1}>
                <Form.Field width={16}>
                  <Search
                    fluid
                    size="big"
                    name="patient"
                    placeholder={t("patinet_card_name_patient")}
                    loading={!searchReady}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                      leading: true,
                    })}
                    results={this.listSearch}
                    value={search_patient}
                    resultClassName="result-wrapper"
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group widths={2}>
                <Form.Field>
                  <label>{t("full_name")}</label>
                  <Input
                    disabled
                    size="big"
                    name="fio"
                    value={fio || ""}
                    placeholder="Иванов Иван Иванович"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>E-mail</label>
                  <Input
                    disabled
                    size="big"
                    name="email"
                    value={email || ""}
                    placeholder="patient@example.ru"
                    onChange={this.handleChange}
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group widths={2}>
                <Form.Field>
                  {id && (
                    <Button
                      size="big"
                      fluid
                      content={t("clear")}
                      labelPosition="right"
                      icon="delete"
                      negative
                      onClick={this.clearPatient}
                    />
                  )}
                </Form.Field>
                <Form.Field>
                  {id && (
                    <Button
                      size="big"
                      fluid
                      as={RouterLink}
                      to={"/patient/info"}
                      content={t("patient_data")}
                      labelPosition="right"
                      icon="clipboard"
                      primary
                    />
                  )}
                </Form.Field>
              </Form.Group>
            </Form>
            <Header>{t("latest_selected")}</Header>
            <List animated divided selection className="dozelist" verticalAlign="middle" size="large">
              {this.last.map((pat, i) => {
                return (
                  <List.Item key={"pat" + i} onClick={() => this.chose(pat.id)}>
                    <List.Content floated="right">
                      {pat.birthdate && <div className="price">{moment(pat.birthdate, "x").format("DD.MM.YYYY")}</div>}
                    </List.Content>

                    <List.Content className="large">
                      <List.Header>{pat.name}</List.Header>

                      {pat.email && <List.Description>{pat.email}</List.Description>}
                    </List.Content>
                  </List.Item>
                );
              })}
            </List>
          </Segment>
        );
      }
    }
  )
);

export default withTranslation()(PatientsList);
