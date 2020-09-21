import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import Slider from "react-slick";

import PatientForm from './PatientForm'
import PatientPassport from './PatientPassport'

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

@inject('router', 'db', 'actions', 'patients')
@observer
class Patient extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,

      step: 0,

      isLoading: false,
      searchQuery: ''
    }
    this.sliderRef = createRef()
  }
  nextStep = () => {
    this.saveForm(true)
    this.sliderRef.current.slickGoTo(1)
    this.setState({ step: 1 })
  }

  savePatient = () => {
    this.props.patients.save()
  }

  saveForm = (noClose) => {
    let shownPage = this.props.router.values && this.props.router.values.page || 'none'
    const {
      birthdate,
      age,
      age_dwmy,
      age_days,
      sex,
      growth,
      weight,
      disease,
      pregnancy,
      gestation,
      trimester,
      lactation,
      driving,
      allergy
    } = this.props.actions.patientForm
    if(shownPage === 'new'){
      Object.assign(this.props.actions.drugStructure.patient, {
        birthdate,
        age,
        age_dwmy,
        age_days,
        sex,
        growth,
        weight,
        disease,
        pregnancy,
        gestation,
        trimester,
        lactation,
        driving,
        allergy
      });
    }
    this.props.db.clearData(false, true)
    if(!noClose) this.props.router.push('/')
    // this.props.db.GetDuration()
  }

  back = () => {
    this.props.router.push('/')
  };

  render() {
    let { step } = this.state
    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: false,
      swipe: false,
      initialSlide: step
    };
    return (
      <div className='h100'>
        {step === 0 ?
          <Menu className="bottom fixed menu three item huge main">
            <Menu.Item color='red' onClick={this.back}>
              Назад
            </Menu.Item>
            <Menu.Item onClick={this.saveForm}>
              Применить
            </Menu.Item>
            <Menu.Item onClick={this.nextStep}>
              Сохранить
            </Menu.Item>
          </Menu>
          :
          <Menu className="bottom fixed menu two item huge main">
            <Menu.Item color='red' onClick={this.back}>
              Отмена
            </Menu.Item>
            <Menu.Item onClick={this.savePatient}>
              Сохранить
            </Menu.Item>
          </Menu>
        }



        <Slider ref={this.sliderRef} {...settings}>
          <div className='scrollwrapper bottomMenu'>
            <PatientForm />
          </div>
          <div className='scrollwrapper bottomMenu'>
            <PatientPassport />
          </div>
        </Slider>

      </div>



    );
  }
};
export default Patient
