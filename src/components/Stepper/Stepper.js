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

    let step = parseInt(values.step || 0)

    // let selectedWarnings = warnings[selectedDrug]
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
      <Responsive className='h100 with-steps' fireOnMount columns='equal' onUpdate={this.handleOnUpdate}>
        {(values.step && values.step > 0) &&
          <Step.Group attached='top' fluid unstackable ordered size='mini'>
            <Step completed={step > 0} active={step == 0} as={RouterLink} to='/concept/dozes'>
              { ( step == 0 || viewType == 'pc' ) &&
                <Step.Content>
                  <Step.Title>Форма ввода</Step.Title>
                  <Step.Description>Сначала лекарственная форма</Step.Description>
                </Step.Content>
              }
            </Step>
            <Step completed={step > 1} active={step == 1} as={RouterLink} to='/concept/dozes/lf/1'>
              { ( step == 1 || viewType == 'pc' ) &&
                <Step.Content>
                  <Step.Title>Лекарственная форма</Step.Title>
                  <Step.Description>{names[stepsData.lf] || ''}</Step.Description>
                </Step.Content>
              }
            </Step>

            <Step completed={ step > 2} active={ step == 2} as={RouterLink} to='/concept/dozes/lf/2'>
              { ( step == 2 || viewType == 'pc' ) &&
                <Step.Content>
                  <Step.Title>Дозировка</Step.Title>
                  <Step.Description>{names[stepsData.dosage] || ''}</Step.Description>
                </Step.Content>
              }
            </Step>

            <Step completed={ step > 3} active={ step == 3} as={RouterLink} to='/concept/dozes/lf/3'>
              { ( step == 3 || viewType == 'pc' ) &&
                <Step.Content>
                  <Step.Title>Способ применения</Step.Title>
                  <Step.Description>{names[stepsData.method] || ''}</Step.Description>
                </Step.Content>
              }
            </Step>
          </Step.Group>
        }
        <Slider ref={this.sliderRef} {...settings}>
          <WayChoice />
          <div className='scrollwrapper'>
            {{
              'lf': <LF />,
              'methods': <Methods />,
              undefined: <LF />
            }[values.way]}
          </div>
          <div className='scrollwrapper'>
            {{
              'lf': <DozeTypes />,
              'methods': <LF />,
              undefined: <DozeTypes />
            }[values.way]}
          </div>
          <div className='scrollwrapper'>
            {{
              'lf': <Methods />,
              'methods': <DozeTypes />,
              undefined: <DozeTypes />
            }[values.way]}
          </div>


          <WayChoice />
        </Slider>
      </Responsive>
    )
  }

};
export default Stepper
