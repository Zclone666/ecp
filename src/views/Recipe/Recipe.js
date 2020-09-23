import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import Drugs from '../../components/Drugs'

import moment from 'moment'
import _ from 'lodash'

import {
  // Sidebar,
  Menu,
  Tab,
  Statistic,
  Input,
  // Search,
  Segment,
  Form,
  Dropdown
  // Message,
  // List,
  // Feed,
  // Button,
  // Responsive,
  // Grid
} from 'semantic-ui-react'

@inject('router', 'db', 'actions', 'recipes', 'patients')
@observer
class Recipe extends Component {
  constructor(props){
    super(props)
    this.state = {
      activeIndex: 0
    }
    //this.contextRef = createRef()
  }

  save = async () => {
    await this.props.recipes.save()
    this.props.router.push('/')
  }

  back = () => {
    this.props.router.push('/')
  };

  handleAddition = (e, { value }) => {
    let id = moment().format('x').toString()
    this.props.patients.patient.set(id, {id, name: value})

  }

  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    if( name === 'patient' ){
      let { patient } = this.props.actions.drugStructure
      let curr = this.props.patients.patient.get(value)
      this.props.actions.drugStructure.patient = _.extend(patient, { id: value, name: curr.name })
    }else{
      this.props.actions.drugStructure[name].val = value
    }
  }


  render() {
    let {
      activeIndex
    } = this.state
    let {
      drugStructure: {
        doctor: {
          val: doctor
        },
        clinic: {
          val: clinic
        },
        patient: {
          id: patient
        }
      },
      doctor: doc
    } = this.props.actions
    // let { patient: { id: patient } } = this.props.actions.drugStructure

    doctor = doctor || doc.name


    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item onClick={this.save}>
            Отправить
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper'>
          <Segment basic>
            <Form>
              <Form.Field>
                <label>Врач</label>
                <Input name='doctor' value={doctor} onChange={this.handleChange} placeholder='Иван Иванов' />
              </Form.Field>
              <Form.Field>
                <label>Пациент</label>
                <Dropdown
                  options={this.props.patients.arr.map((item) => {
                    return {
                      key: item.id, text: item.name, value: item.id
                    }
                  })}
                  placeholder='Иван Иванов'
                  search
                  name='patient'
                  selection
                  fluid
                  allowAdditions
                  value={patient}
                  onAddItem={this.handleAddition}
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <label>ЛПУ</label>
                <Input name='clinic' value={clinic} onChange={this.handleChange} placeholder='ЛПУ' />
              </Form.Field>
            </Form>
            <Drugs isRecipe={true} />
          </Segment>
        </div>

      </>



    );
  }
};
export default Recipe
