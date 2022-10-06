import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Search from "../../components/Search";

import PatientPassport from "../Patient/PatientPassport";
import { withTranslation } from "react-i18next";
import moment from "moment";
import _ from "lodash";

import {
  // Sidebar,
  Menu,
  Input,
  Modal,
  Segment,
  Form,
  // Message,
  // List,
  // Feed,
  Button,
  // Responsive,
  // Grid
} from "semantic-ui-react";

const Prescript = inject(
  "router",
  "db",
  "actions",
  "recipes",
  "patients",
  "tools"
)(
  observer(
    class Prescript extends Component {
      constructor(props) {
        super(props);
        this.state = {
          open: false,
          isFilled: false,
          code: null,
          search_clinic: "",
          search_patient: "",
        };
        //this.contextRef = createRef()
        this.debouncedSearch = _.debounce(this.callSearchFunction, 500, {
          leading: false,
        });
      }

      callSearchFunction = (value) => {
        this.props.tools.searchClinic(value);
      };

      setOpen = (open) => {
        open = open || false;
        this.setState({ open });
      };
      setOpenCode = (openCode) => {
        openCode = openCode || false;
        this.setState({ openCode }, () => {
          if (!openCode) this.props.router.push("/");
        });
      };
      save = async () => {
        await this.props.recipes.saveList();
        // console.log({res});
        // if( !code ) return
        // this.setState({ code })
        // this.setOpenCode(true)
        // this.props.router.push('/')
      };

      back = () => {
        this.props.router.push("/");
        this.props.recipes.code = null;
      };
      savePatient = async () => {
        let res = await this.props.patients.save();

        if (res) {
          this.setOpen(false);
          this.handleChange(null, { name: "patient", value: res.key });

          // this.setState({ [`search_patient`]: res.fio });
        }
      };
      // handleAddition = async (e, { name, value }) => {
      //   // console.log({ name, value });
      //   let key = moment().format('x').toString()
      //   await this.props.patients.patient.set(key, {key, name: value, id: null})
      //   this.handleChange(null, { name: 'patient', value: key })
      // }

      handleChange = async (e, { name, value }) => {
        if (!name && !value) {
          name = e.target.name;
          value = e.target.value;
        }
        let { checkData } = this.props.actions;
        if (name === "patient") {
          // console.log({ value });
          let curr = await this.props.patients.patient.get(value);
          if (curr?.id) await this.props.patients.request(curr.id);
          // if ((!curr || !curr.email) && curr.id) curr = await this.props.patients.request(curr.id);
          // curr = curr || {};
          // this.props.patients.current = _.extend(patient, {
          //   id: curr.id || null,
          //   key: value,
          //   name: curr.name || null,
          //   email: curr.email || null,
          //   fio: curr.fio || null,
          // });
        } else if (name === "doctor") {
          // let { doctor_key } = this.props.actions.drugStructure
          let newDoc = _.find(checkData.doctor, { id: value });
          this.props.actions.drugStructure.doctor_id = newDoc.id;
          this.props.actions.drugStructure.doctor_name = newDoc.name;
        } else if (name === "clinic") {
          // let { clinic } = this.props.actions.drugStructure
          // let newLpu = _.find(checkData.lpu, { id: value });
          // this.props.actions.drugStructure.clinic_id = newLpu.id;
          // this.props.actions.drugStructure.clinic_name = newLpu.name;
        } else if (name === "email") {
          this.props.patients.current.email = value;
        } else {
          this.props.actions.drugStructure[name].val = value;
        }
      };

      handleSearchChange = (e, { name, value }) => {
        this.setState({ [`search_clinic`]: value });
        if (value.length > 1) {
          this.props.tools.searchReady = false;
          this.debouncedSearch(value);
        }
      };

      handleResultSelect = async (e, { name, result }) => {
        this.props.actions.drugStructure.clinic_id = result.id;
        this.props.actions.drugStructure.clinic_name = result.description;
        this.props.actions.clinic.id = result.id;
        this.props.actions.clinic.name = result.description;
        // this.handleChange(null, { name: "clinic", value: result.id });
        // this.handleChange({ target: { name: "lpuName", value: result.description } });
        this.setState({ [`search_clinic`]: result.description });
      };

      handlePatientResultSelect = async (e, { name, result }) => {
        //let newName = name === 'co_disease' ? 'disease' : name
        await this.props.patients.request(result.id);
        this.setState({ [`search_${name}`]: this.props.patients.current.fio });
        // this.props.router.push("/patient/info");
      };

      handlePatientSearchChange = (e, { name, value }) => {
        this.setState({ [`search_${name}`]: value });
        if (value.length > 1) {
          this.props.patients.searchReady = false;
          this.props.patients.search(value);
        }
      };

      get patientsListSearch() {
        let arr = [];
        this.props.patients.searchRows.forEach((item, i) => {
          // console.log({ item });
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

      componentDidMount() {
        this.handleResultSelect(null, {
          name: "clinic",
          result: {
            id: this.props.actions.drugStructure.clinic_id,
            description: this.props.actions.drugStructure.clinic_name,
          },
        });
      }
      componentDidUpdate(prevProps, prevState) {
        let { clinic_id } = this.props.actions.drugStructure;
        // console.log({
        //   clinic_id: this.props.actions.drugStructure.clinic_id,
        //   clinic_id2: prevProps.actions.drugStructure.clinic_id,
        // });
        if (prevProps.actions.drugStructure.clinic_id && !clinic_id) {
          this.setState({ [`search_clinic`]: "" });
        }
      }

      get listSearch() {
        let arr = [];
        this.props.tools.searchClinicRows.forEach((item, i) => {
          if (item.name) {
            arr.push({
              id: item.id,
              key: i,
              title: "",
              description: item.name,
            });
          }
        });
        return arr;
      }

      render() {
        let { open, search_clinic, search_patient } = this.state;
        let {
          actions: {
            drugStructure: { doctor_name: doctor },
            isPrescriptFilled,
            doctor: doc,
          },
          patients: { current: patient },
          tools: { searchReady },
        } = this.props;
        const { t } = this.props.actions;

        doctor = doctor || doc.name;

        // let noEmail = !(this.props.patients.current.email && this.props.patients.current.email.length > 0)
        let noEmail = false;
        // console.log( patient );

        return (
          <>
            <Menu className="bottom fixed menu two item huge main">
              <Menu.Item color="red" onClick={this.back}>
                {t("back")}
              </Menu.Item>
              <Menu.Item disabled={!isPrescriptFilled} onClick={this.save}>
                {t("main_drugs_prescribe")}
              </Menu.Item>
            </Menu>

            <div className="scrollwrapper">
              <Segment basic>
                <Form>
                  <Form.Field>
                    <label>{t("doctor")}</label>
                    <Input name="doctor" value={doctor} readOnly className="readonly" />
                  </Form.Field>

                  <Form.Group>
                    <Form.Field width={16}>
                      <label>{t("patient")}</label>
                      <Search
                        fluid
                        size="big"
                        name="patient"
                        noResultsMessage={t("main_search_notFound")}
                        placeholder={t("patinet_card_name_patient")}
                        loading={!searchReady}
                        onResultSelect={this.handlePatientResultSelect}
                        onSearchChange={_.debounce(this.handlePatientSearchChange, 500, {
                          leading: true,
                        })}
                        results={this.patientsListSearch}
                        value={search_patient || patient?.fio}
                        resultclassname="result-wrapper"
                      />
                      {/* {patient && patient.fio && <Label>{patient.fio}</Label>} */}
                    </Form.Field>
                    <Form.Field>
                      <label>&nbsp;</label>
                      <Modal
                        onClose={() => this.setOpen(false)}
                        onOpen={() => this.setOpen(true)}
                        open={open}
                        trigger={<Button>{t("add")}</Button>}
                      >
                        <Modal.Header>{t("create_patient")}</Modal.Header>
                        <Modal.Content>
                          <PatientPassport />
                        </Modal.Content>
                        <Modal.Actions>
                          <Button color="black" onClick={() => this.setOpen(false)}>
                            {t("main_parser_cancel")}
                          </Button>
                          <Button
                            content={t("create")}
                            labelPosition="right"
                            icon="checkmark"
                            onClick={() => this.savePatient()}
                            positive
                          />
                        </Modal.Actions>
                      </Modal>
                    </Form.Field>
                  </Form.Group>
                  <Form.Field error={patient.key && noEmail}>
                    <label>{t("mail_patient")}</label>
                    <Input
                      name="email"
                      value={patient.email}
                      onChange={this.handleChange}
                      placeholder="some@email.ru"
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>{t("health_care_facility")}</label>
                    <Search
                      fluid
                      size="big"
                      name="clinic"
                      noResultsMessage={t("main_search_notFound")}
                      placeholder={t("enter_name_clinic")}
                      loading={!searchReady}
                      onResultSelect={this.handleResultSelect}
                      onSearchChange={this.handleSearchChange}
                      results={this.listSearch}
                      value={search_clinic}
                      resultclassname="result-wrapper"
                    />
                  </Form.Field>
                </Form>
              </Segment>
            </div>
          </>
        );
      }
    }
  )
);

export default withTranslation()(Prescript);
