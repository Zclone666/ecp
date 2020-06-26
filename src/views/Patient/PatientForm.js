import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import BirthDate from '../../components/BirthDate'


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
  Form
} from 'semantic-ui-react'

import _ from 'lodash';


@inject('router', 'db', 'actions')
@observer
class PatientForm extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
    //this.contextRef = createRef()
  }

  render() {
    const { isLoading, searchQuery, results } = this.state
    return (
      <Segment basic>
        <Form>
          <Form.Group>
            <BirthDate />
          </Form.Group>
          <Form.Group>
            <BirthDate />
          </Form.Group>
        </Form>
      </Segment>
    );
  }
};
export default PatientForm
