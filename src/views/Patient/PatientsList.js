import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import Slider from "react-slick";

import PatientForm from './PatientForm'
import PatientPassport from './PatientPassport'

import {
  Segment,
  List,
  Button,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions', 'patients')
@observer
class PatientsList extends Component {
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

  back = () => {
    this.props.router.push('/')
  };
  chose = async (id) => {
    await this.props.patients.request(id)
    this.props.router.push('/patient/info')
  }
  get list(){
    let arr = []
    this.props.patients.patient.forEach((item, i) => {
      arr.push(item)
    });
    return arr
  }

  render() {
    let { patients } = this.props
    return (
      <Segment basic>
        <List divided relaxed verticalAlign='middle' size='large' >
          {patients.ready && this.list.map(( patient, i ) => {

            return(
              <>
                <List.Item
                  key={'analog'+i}
                  onClick={() => this.chose(patient.id)}
                >

                  <List.Content floated='right'>
                    <Button>Выбрать</Button>
                  </List.Content>
                  <List.Content className='large'>
                    <List.Header>{patient.name}</List.Header>
                  </List.Content>
                </List.Item>

              </>
            )

          })}
        </List>
      </Segment>
    );
  }
};
export default PatientsList
