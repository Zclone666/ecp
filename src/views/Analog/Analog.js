import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import Analogs from '../../components/Analogs'

import {
  Menu
} from 'semantic-ui-react'

import _ from 'lodash';

const Analog = inject('router', 'db', 'actions', 'drugs', 'warnings')(observer(class Analog extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: ''
    }
    this.contextRef = createRef()
  }

  saveDoze = async () => {
    // let {
    //   drugs: { setDosageParams },
    //   router: { location }
    // } = this.props
    // await setDosageParams(location.pathname)
    // this.props.router.push('/')
    // let current = drugsDosages.data.get(currDrug.key) || {};
    // drugsDosages.data.set( currDrug.key, _.extend(current, { ...current, url: location.pathname }) );

  }

  back = () => {
    this.props.router.push('/')

  };

  render() {

    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper bottomMenu'>
          <Analogs />
        </div>

      </>



    );
  }
}));

export default Analog
