import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";

import Drugs from "../../components/Drugs";

import PatientPassport from "../Patient/PatientPassport";

import moment from "moment";
import _ from "lodash";

import {
  // Sidebar,
  Menu,
  Tab,
  Statistic,
  Input,
  Modal,
  Segment,
  Form,
  Dropdown,
  Header,
  // Message,
  // List,
  // Feed,
  Button,
  // Responsive,
  // Grid
} from "semantic-ui-react";

@inject("router", "db", "actions", "recipes", "patients")
@observer
class Prescript extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isFilled: false,
      code: null,
    };
    //this.contextRef = createRef()
  }
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
    let code = await this.props.recipes.saveList();
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
      let { name, value } = e.target;
    }
    let { checkData } = this.props.actions;
    if (name === "patient") {
      let patient = this.props.patients.current;
      let curr = await this.props.patients.patient.get(value);
      if ((!curr || !curr.email) && curr.id) curr = await this.props.patients.request(curr.id);
      curr = curr || {};
      this.props.patients.current = _.extend(patient, {
        id: curr.id || null,
        key: value,
        name: curr.name || null,
        email: curr.email || null,
        fio: curr.fio || null,
      });
    } else if (name === "doctor") {
      // let { doctor_key } = this.props.actions.drugStructure
      let newDoc = _.find(checkData.doctor, { id: value });
      this.props.actions.drugStructure.doctor_id = newDoc.id;
      this.props.actions.drugStructure.doctor_name = newDoc.name;
    } else if (name === "clinic") {
      // let { clinic } = this.props.actions.drugStructure
      let newLpu = _.find(checkData.lpu, { id: value });
      this.props.actions.drugStructure.clinic_id = newLpu.id;
      this.props.actions.drugStructure.clinic_name = newLpu.name;
    } else if (name === "email") {
      this.props.patients.current.email = value;
    } else {
      this.props.actions.drugStructure[name].val = value;
    }
  };

  render() {
    let { open } = this.state;
    let {
      actions: {
        drugStructure: { doctor_name: doctor, clinic_id: clinic },
        isPrescriptFilled,
        doctor: doc,
        checkData,
      },
      patients: { current: patient },
      recipes: { code },
    } = this.props;

    doctor = doctor || doc.name;

    // let noEmail = !(this.props.patients.current.email && this.props.patients.current.email.length > 0)
    let noEmail = false;
    // console.log({ doctor, clinic, patient });

    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color="red" onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item disabled={!isPrescriptFilled} onClick={this.save}>
            Назначить
          </Menu.Item>
        </Menu>

        <div className="scrollwrapper">
          <Segment basic>
            <Form>
              <Form.Field>
                <label>Врач</label>
                <Input name="doctor" value={doctor} readOnly className="readonly" />
              </Form.Field>

              <Form.Group>
                <Form.Field width={16}>
                  <label>Пациент</label>
                  <Dropdown
                    options={this.props.patients.arr.map((item) => {
                      return {
                        key: item.key,
                        text: item.name,
                        value: item.key,
                      };
                    })}
                    placeholder="Иван Иванов"
                    search
                    name="patient"
                    selection
                    fluid
                    value={patient.key}
                    onAddItem={this.handleAddition}
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>&nbsp;</label>
                  <Modal
                    onClose={() => this.setOpen(false)}
                    onOpen={() => this.setOpen(true)}
                    open={open}
                    trigger={<Button>Добавить</Button>}
                  >
                    <Modal.Header>Создать пациента</Modal.Header>
                    <Modal.Content>
                      <PatientPassport />
                    </Modal.Content>
                    <Modal.Actions>
                      <Button color="black" onClick={() => this.setOpen(false)}>
                        Отмена
                      </Button>
                      <Button
                        content="Создать"
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
                <label>E-mail пациента</label>
                <Input name="email" value={patient.email} onChange={this.handleChange} placeholder="some@email.ru" />
              </Form.Field>
              <Form.Field>
                <label>ЛПУ</label>
                <Dropdown
                  options={checkData.lpu.map((item) => {
                    return {
                      key: item.id,
                      text: item.name,
                      value: item.id,
                    };
                  })}
                  placeholder="Клиника"
                  search
                  name="clinic"
                  selection
                  fluid
                  value={clinic}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Segment>
        </div>
      </>
    );
  }
}
export default Prescript;
