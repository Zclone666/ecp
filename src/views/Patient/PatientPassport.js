import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import BirthDate from '../../components/BirthDate'
import Search from '../../components/Search'


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
  Grid,
  Form,
  Input,
  Checkbox,
  Header,
  Dropdown
} from 'semantic-ui-react'

import _ from 'lodash';


@inject('router', 'diseases', 'actions')
@observer
class PatientPassport extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
    //this.contextRef = createRef()
  }

  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    this.props.actions.patientPassport[name] = value;

  }

  render() {
    const {
      id,
      // name,
      email,
      // miscode,
      // misid,
      fio
    } = this.props.actions.patientPassport

    return (
      <Segment basic>
        <Form>
          <Form.Group widths={2}>
            <Form.Field>
              <label>ФИО</label>
              <Input
                size='big'
                name='fio'
                value={fio || ''}
                placeholder='Иванов Иван Иванович'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>E-mail</label>
              <Input
                size='big'
                name='email'
                value={email || ''}
                placeholder='patient@example.ru'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    );
  }
};
export default PatientPassport
