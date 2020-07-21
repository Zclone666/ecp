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
  Responsive
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class Schedule extends Component {
  constructor(props){
    super(props)
    this.state = {
      active: false
    }
  }
  handleChange = () => {
    this.setState({ active: !this.state.active })
  }
  handleChangeTime = () => {

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
      db: { drugDosage: { drug, form, methodform, names } },
      router: { values },
      day, index
    } = this.props
    let { active } = this.state
    
    return (
      <Segment
        className='day'
        primary={active}
        onClick={this.handleChange}
        name='weekday'
        value='mon'
      >
        <Label color={active ? 'blue' : ''} attached='top'>
          <Icon name={!!active ? 'check square' : 'square outline'} />
          {day}
        </Label>
        <Form className='leftPadded'>
          <Form.Group>
            <Form.Field className='fluid'>
              <Dropdown
                className='tiny'
                name='time'
                onChange={this.handleChangeTime}
                button
                floating
                search
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
          </Form.Group>
          <Form.Group>
            <Form.Field className='fluid'>
              <Button size='tiny'><Icon name='plus' />Время приема</Button>
            </Form.Field>
          </Form.Group>
        </Form>

      </Segment>
    )
  }

};
export default Schedule
