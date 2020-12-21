import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import Drugs from '../../components/Drugs'

import PatientPassport from '../Patient/PatientPassport'

import moment from 'moment'
import _ from 'lodash'

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
} from 'semantic-ui-react'

@inject('router', 'db', 'actions', 'recipes', 'patients')
@observer
class Recipe extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
      openCode: false,
      code: null
    }
    //this.contextRef = createRef()
  }
  setOpen = (open) => {
    open = open || false
    this.setState({ open })
  }
  setOpenCode = (openCode) => {
    openCode = openCode || false
    this.setState({ openCode }, () => {
      if(!openCode) this.props.router.push('/')
    })
  }
  save = async () => {
    let code = await this.props.recipes.save()
    // console.log({res});
    if( !code ) return
    this.setState({ code })
    this.setOpenCode(true)
    // this.props.router.push('/')
  }

  back = () => {
    this.props.router.push('/')
  };
  savePatient = async () => {
    let res = await this.props.patients.save()

    if(res){
      this.setOpen(false)
      this.handleChange(null, { name: 'patient', value: res.key })
    }
  }
  // handleAddition = async (e, { name, value }) => {
  //   // console.log({ name, value });
  //   let key = moment().format('x').toString()
  //   await this.props.patients.patient.set(key, {key, name: value, id: null})
  //   this.handleChange(null, { name: 'patient', value: key })
  // }

  handleChange = async (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    let {
      checkData
    } = this.props.actions
    if( name === 'patient' ){
      let { patient } = this.props.actions.drugStructure
      let curr = await this.props.patients.patient.get(value)
      if((!curr || !curr.email) && curr.id) curr = await this.props.patients.request(curr.id)
      curr = curr || {}
      this.props.actions.drugStructure.patient = _.extend(patient, { id: curr.id || null, key: value, name: curr.name || null, email: curr.email || null, fio: curr.fio || null })
    }else if( name === 'doctor' ){
      let { doctor } = this.props.actions.drugStructure
      let newDoc = _.find(checkData.doctor, { 'id': value });
      this.props.actions.drugStructure.doctor = _.extend(doctor, {key: newDoc.id, val: newDoc.name})
    }else if( name === 'clinic' ){
      let { clinic } = this.props.actions.drugStructure
      let newLpu = _.find(checkData.lpu, { 'id': value });
      this.props.actions.drugStructure.clinic = _.extend(clinic, {key: newLpu.id, val: newLpu.name})
    }else if( name === 'email' ){
      this.props.actions.drugStructure.patient.email = value
    }else{
      this.props.actions.drugStructure[name].val = value
    }
  }


  render() {
    let {
      open, code, openCode
    } = this.state
    let {
      drugStructure: {
        doctor: {
          key: doctor
        },
        clinic: {
          key: clinic
        },
        patient
      },
      doctor: doc,
      checkData
    } = this.props.actions
    // let { patient: { id: patient } } = this.props.actions.drugStructure

    doctor = doctor || doc.name

    let noEmail = !(this.props.actions.drugStructure.patient.email && this.props.actions.drugStructure.patient.email.length > 0)

    // console.log({ doctor, clinic, patient });

    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item disabled={noEmail} onClick={this.save}>
            Отправить
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper'>
          <Segment basic>
            <Form>
              <Form.Field>
                <label>Врач</label>
                <Dropdown
                  options={checkData.doctor.map((item) => {
                    return {
                      key: item.id, text: item.name, value: item.id
                    }
                  })}
                  placeholder='Иван Иванов'
                  search
                  name='doctor'
                  selection
                  fluid

                  value={doctor}
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Group>
                <Form.Field width={16}>
                  <label>Пациент</label>
                  <Dropdown
                    options={this.props.patients.arr.map((item) => {
                      return {
                        key: item.key, text: item.name, value: item.key
                      }
                    })}
                    placeholder='Иван Иванов'
                    search
                    name='patient'
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
                      <Button color='black' onClick={() => this.setOpen(false)}>
                        Отмена
                      </Button>
                      <Button
                        content="Создать"
                        labelPosition='right'
                        icon='checkmark'
                        onClick={() => this.savePatient()}
                        positive
                      />
                    </Modal.Actions>
                  </Modal>

                </Form.Field>
              </Form.Group>
              <Form.Field error={patient.key && noEmail}>
                <label>E-mail пациента</label>
                <Input name='email' value={patient.email} onChange={this.handleChange} placeholder='some@email.ru' />
              </Form.Field>
              <Form.Field>
                <label>ЛПУ</label>
                <Dropdown
                  options={checkData.lpu.map((item) => {
                    return {
                      key: item.id, text: item.name, value: item.id
                    }
                  })}
                  placeholder='Клиника'
                  search
                  name='clinic'
                  selection
                  fluid

                  value={clinic}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
            <Drugs isRecipe={true} />
          </Segment>
        </div>
        <Modal
          onClose={() => this.setOpenCode(false)}
          onOpen={() => this.setOpenCode(true)}
          open={openCode}
        >
          <Modal.Header>Ваш код для аптеки</Modal.Header>
          <Modal.Content>
            <Header as='h1'>{code}</Header>
          </Modal.Content>
          <Modal.Actions>
            <Button
              content="ОК"
              labelPosition='right'
              icon='checkmark'
              onClick={() => this.setOpenCode(false)}
              positive
            />
          </Modal.Actions>
        </Modal>
      </>



    );
  }
};
export default Recipe
