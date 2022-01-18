import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment'

import {
  List,
  Icon,
  Form,
  Label,
  Segment,
  Input,
  Button,
  Dropdown,
  Responsive,
  Divider
} from 'semantic-ui-react'
import { withTranslation } from "react-i18next";
import _ from 'lodash';

const Schedule = inject('db', 'actions', 'router', 'drugs', 'dosages')(observer(class Schedule extends Component {
  constructor(props){
    super(props)
    this.state = {
      active: false,
      time: [],
      interval: null
    }
  }
  handleChange = () => {
    this.setState({ active: !this.state.active })
  }
  handleChangeTime = (e, {index, name, value}) => {
    //console.log({name, value});
    e.preventDefault()
    let { time } = this.state
    if(index === time.length){
      time.push(value)
    }else{
      time[index] = value
    }
    this.setState({ time })
    return false
  }
  handleRemoveTime = ({ index }) => {
    // console.log({name, value});
    let { time } = this.state
    time.splice(index, 1)
    this.setState({ time })
    // if(index === time.length){
    //   time.push(value)
    // }else{
    //   time[index] = value
    // }
  }
  handleChangeInterval = (e, { name, value }) => {
    //console.log({name, value});
    e.preventDefault()

    this.setState({ interval: value })
    return false
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData
      },
      dosages: { current: { drug, form, methodform, names } },
      router: { values },
      day, index,t
    } = this.props
    let { active, time, interval } = this.state

    return (
      <Segment
        className='day'
        primary={active}

        name={'weekday_'+index}
        value='mon'
      >
        <Label onClick={this.handleChange} color={active ? 'blue' : ''} attached='top'>
          <Icon name={!!active ? 'check square' : 'square outline'} />
          {day}
        </Label>
        <Form className='leftPadded'>

          <Form.Field className='fluid'>
            <Button.Group size='tiny' className='four fluid'>

              <Button
                primary={interval == 1}
                disabled={!active}
                onClick={this.handleChangeInterval}
                name='interval'
                value={1}
              >
                1
              </Button>
              <Button
                primary={interval == 2}
                disabled={!active}
                onClick={this.handleChangeInterval}
                name='interval'
                value={2}
              >
                2
              </Button>
              <Button
                primary={interval == 3}
                disabled={!active}
                onClick={this.handleChangeInterval}
                name='interval'
                value={3}
              >
                3
              </Button>
              <Button
                primary={interval == 4}
                disabled={!active}
                onClick={this.handleChangeInterval}
                name='interval'
                value={4}
              >
                4
              </Button>

            </Button.Group>
            <Label
              size='tiny' className='fluid'
            >
              {t("once_day")}
            </Label>
          </Form.Field>
          <Divider horizontal>{t("or")}</Divider>

          {time.map(( item, x ) => {
            return(
              <Form.Field className='fluid' key={'time'+index}>
                <Button.Group size='tiny' className='fluid'>
                  <Dropdown
                    className='tiny primary button'
                    name={index+'_time_'+x}
                    onChange={(e, {name, value}) => this.handleChangeTime(e, {x, name, value})}


                    search
                    disabled={!active}
                    options={_.map(Array(48), (item, i) => {
                      return {
                        key: i+1,
                        text: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30',
                        value: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30'
                      }
                    })}
                    text={item}
                  />
                  <Button primary icon size='tiny' onClick={() => this.handleRemoveTime({x})}><Icon name='delete' /></Button>
                </Button.Group>


              </Form.Field>
            )
          })}
            <Form.Field className='fluid'>
              <Dropdown
                className='tiny fluid'
                name={index+'_time_'+time.length}
                onChange={(e, {name, value}) => this.handleChangeTime(e, {index: time.length, name, value})}
                button
                floating
                search
                disabled={!active}
                options={_.map(Array(48), (item, i) => {
                  return {
                    key: i+1,
                    text: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30',
                    value: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30'
                  }
                })}
                text={'Время'}
              />
            </Form.Field>


        </Form>

      </Segment>
    )
  }

}));

export default withTranslation()(Schedule)
