import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Slider from "react-slick";

import PatientForm from "./PatientForm";
import PatientPassport from "./PatientPassport";

import Search from "../../components/Search";

import { Segment, List, Button, Form, Input } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

@inject("router", "db", "actions", "patients")
@observer
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
                placeholder="Введите имя пациента"
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
              <label>ФИО</label>
              <Input
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
                  content="Очистить"
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
                  content="Анамнез"
                  labelPosition="right"
                  icon="clipboard"
                  primary
                />
              )}
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    );
  }
}
export default PatientsList;
