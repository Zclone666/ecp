import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import Stepper from '../../components/Stepper'

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
class Dozes extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: ''
    }
    this.contextRef = createRef()
  }

  saveDoze = () => {
    let {
      db: { drugs, drugsDosages, currDrug, setDosageParams },
      router: { location }
    } = this.props
    setDosageParams(location.pathname)
    this.props.router.push('/')
    // let current = drugsDosages.data.get(currDrug.key) || {};
    // drugsDosages.data.set( currDrug.key, _.extend(current, { ...current, url: location.pathname }) );

  }

  back = () => {
    this.props.router.push('/')
    this.props.actions.stepsData = {
      key: null,
      way: null,
      step: null,
      form: null,
      method: null,
      pack: {},
      dosage: {},
    }
  };

  render() {

    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item onClick={this.saveDoze}>
            Сохранить
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper'>
          <Stepper />
        </div>

      </>



    );
  }
};
export default Dozes
