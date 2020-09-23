import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import Slider from "react-slick";

import PatientForm from './PatientForm'
import PatientPassport from './PatientPassport'
import PatientsList from './PatientsList'

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

      step: null,

      isLoading: false,
      searchQuery: ''
    }
    this.sliderRef = createRef()
  }
  newPatient = () => {
    this.saveForm(true)
    this.props.router.push('/patient/passport')
  }
  nextStep = () => {
    let { step } = this.state
    this.sliderRef.current.slickGoTo(step+1)
    this.setState({ step: step+1 })
  }
  prevStep = () => {
    let { step } = this.state
    this.sliderRef.current.slickGoTo(step-1)
    this.setState({ step: step-1 })
  }
  goTo = (x) => {
    this.sliderRef.current.slickGoTo(x)
    this.setState({ step: x })
  }

  savePatient = async () => {
    let res = await this.props.patients.save()
    if(res){
      this.props.router.push('/')
    }
  }

  saveForm = (noClose) => {
    let shownPage = this.props.router.values && this.props.router.values.page || 'none'
    const {
      birthdate,
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
    if(shownPage === 'info'){
      Object.assign(this.props.actions.drugStructure.patient, {
        birthdate,
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
  componentDidUpdate( prevProps, prevState ){
    let {
      router: { values }
    } = this.props
    // console.log({ next: values.step, prev: this.state.activeIndex });

    let step = null
    switch (values.page) {
      case 'list':
        step = 0
        break;
      case 'info':
        step = 1
        break;
      case 'passport':
        step = 2
        break;
      default:

    }
    if( step !== this.state.step ){
      this.goTo(step)
    }

  }
  render() {
    let shownPage = this.props.router.values && this.props.router.values.page || 'none'
    let section = (this.props.router && this.props.router.match && this.props.router.match.name) || 'none'
    let { step } = this.state
    switch (shownPage) {
      case 'list':
        step = 0
        break;
      case 'info':
        step = 1
        break;
      case 'passport':
        step = 2
        break;
      default:

    }
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
        {step === 0 &&
          <Menu className="bottom fixed menu two item huge main">
            <Menu.Item color='red' onClick={this.back}>
              Отмена
            </Menu.Item>
            <Menu.Item as={RouterLink} to='/patient/info'>
              Новый
            </Menu.Item>
          </Menu>
        }
        {step === 1 &&
          <Menu className="bottom fixed menu three item huge main">
            <Menu.Item color='red' onClick={this.back}>
              Назад
            </Menu.Item>
            <Menu.Item onClick={() => this.saveForm(false)}>
              Применить
            </Menu.Item>
            <Menu.Item onClick={this.newPatient}>
              Сохранить
            </Menu.Item>
          </Menu>
        }
        {step === 2 &&
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
            <PatientsList />
          </div>
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
