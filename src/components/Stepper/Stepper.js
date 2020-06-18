import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';

import Slider from "react-slick";
import RouterLink from '../../router/a'

import WayChoice from './WayChoice'
import LF from './LF'
import DozeTypes from './DozeTypes'
import Methods from './Methods'

import {
  Transition,
  Accordion,
  Icon,
  Step,
  Responsive
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class Stepper extends Component {
  constructor(props){
    super(props)
    this.state = {
      activeIndex: '0',
      viewType: 'pc'
    }
    this.sliderRef = createRef()
  }

  steps = {
    lf: [
      { name: 'type', text: 'Форма ввода' },
      { name: 'lf', text: 'Лекарственная форма' },
      { name: 'dosage', text: 'Дозировка' },
      { name: 'method', text: 'Способ применения' }
    ],
    methods: [
      { name: 'type', text: 'Форма ввода' },
      { name: 'method', text: 'Способ применения' },
      { name: 'lf', text: 'Лекарственная форма' },
      { name: 'dosage', text: 'Дозировка' }
    ]
  }

  handleClick = (e, titleProps) => {
    e.preventDefault()
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
    return false
  }
  next = () => {
    this.sliderRef.slickNext();
  }
  previous = () => {
    this.sliderRef.slickPrev();
  }
  goTo = (x) => {
    // console.log('go to ', x);
    // console.log('this.sliderRef', this.sliderRef);
    this.sliderRef.current.slickGoTo(x)
  }
  componentDidUpdate( prevProps, prevState ){
    let {
      router: { values }
    } = this.props
    // console.log({ next: values.step, prev: this.state.activeIndex });
    if( values.step !== prevState.activeIndex ){
      this.setState({ activeIndex: values.step }, () => {
        this.goTo(parseInt(this.state.activeIndex || 0))
      })

    }
  }
  handleOnUpdate = (event, data) => {
    console.log({event, data});
    if( data.width > 479 ){
      this.setState({ viewType: 'pc' })
    }else{
      this.setState({ viewType: 'mobile' })
    }
  }
  render(){
    let { activeIndex, viewType } = this.state
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData
      },
      db: { drugDosage: { lf, druglf, methodstolf, names } },
      router: { values }
    } = this.props

    let currStep = parseInt(values.step || 0)
    let way = values.way || 'lf'
    // let selectedWarnings = warnings[selectedDrug]
    const settings = {

      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: false,
      swipe: false,
      initialSlide: currStep
    };
    //console.log({ way, currStep });
    return (
      <Responsive className='h100 with-steps' fireOnMount columns='equal' onUpdate={this.handleOnUpdate}>
        <Step.Group attached='top' fluid unstackable ordered size='tiny'>
          {this.steps[way].map(( step, i ) => {
            let url = '/concept/dozes'
            if( i > 0 && i <= currStep ) {
              url += `/${way}/${i}`
            } else if( i !== 0 ) { url = '' }
            return(
              <Step completed={currStep > i} active={currStep == i} as={ ( i <= currStep ) ? RouterLink : Step } to={url}>
                { ( currStep == i || viewType == 'pc' ) &&
                  <Step.Content>
                    <Step.Title>{step.text}</Step.Title>
                    <Step.Description>{names[stepsData[step.name]] || ''}</Step.Description>
                  </Step.Content>
                }
              </Step>
            )
          })}
        </Step.Group>
        <Slider ref={this.sliderRef} {...settings}>
          <WayChoice />
          <div className='scrollwrapper'>
            {{
              'lf': <LF />,
              'methods': <Methods />,
              undefined: <LF />
            }[way]}
          </div>
          <div className='scrollwrapper'>
            {{
              'lf': <DozeTypes />,
              'methods': <LF />,
              undefined: <DozeTypes />
            }[way]}
          </div>
          <div className='scrollwrapper'>
            {{
              'lf': <Methods />,
              'methods': <DozeTypes />,
              undefined: <Methods />
            }[way]}
          </div>


          <WayChoice />
        </Slider>
      </Responsive>
    )
  }

};
export default Stepper
