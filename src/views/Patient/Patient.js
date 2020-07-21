import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import PatientForm from './PatientForm'

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
  Grid
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class Patient extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: ''
    }
    this.contextRef = createRef()
  }

  saveForm = () => {
    let shownPage = this.props.router.values && this.props.router.values.page || 'none'
    const {
      birthDate,
      age,
      age_dwmy,
      age_days,
      sex,
      growth,
      weight,
      disease,
      disease2,
      pregnancy,
      gestation,
      trimester,
      lactation,
      driving,
      allergy
    } = this.props.actions.patientForm
    if(shownPage === 'new'){
      Object.assign(this.props.actions.drugStructure.patient, {
        birthDate,
        age,
        age_dwmy,
        age_days,
        sex,
        growth,
        weight,
        disease,
        disease2,
        pregnancy,
        gestation,
        trimester,
        lactation,
        driving,
        allergy
      });

    }
    this.props.router.push('/')
    // this.props.db.GetDuration()
  }

  back = () => {
    this.props.router.push('/')
  };

  render() {

    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item onClick={this.saveForm}>
            Сохранить
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper bottomMenu'>
          <PatientForm />
        </div>

      </>



    );
  }
};
export default Patient
