import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import { Stepper } from '../../components/Clinrecs'


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

@inject('router', 'db', 'actions', 'drugs', 'warnings', 'clinrecs')
@observer
class Clinrecs extends Component {
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
    let {
      drugs: { setLiquidParams }
    } = this.props
    await setLiquidParams()
    this.props.router.push('/')
    // let current = drugsDosages.data.get(currDrug.key) || {};
    // drugsDosages.data.set( currDrug.key, _.extend(current, { ...current, url: location.pathname }) );

  }

  backward = () => {
    let {
      actions: { clinrecCheckerStep }
    } = this.props
    let step = clinrecCheckerStep > 1 ? parseInt(clinrecCheckerStep)-1 : 1
    this.props.router.push('/clinrec/checker/'+step)
  };
  forward = () => {
    let {
      clinrecs: { checker },
      actions: { clinrecCheckerStep }
    } = this.props
    let step = clinrecCheckerStep < _.keys(checker).length ? parseInt(clinrecCheckerStep)+1 : _.keys(checker).length
    this.props.router.push('/clinrec/checker/'+step)
  };

  home = () => {
    this.props.router.push('/')
  };

  render() {
    let showPage = !!(this.props.router.values && this.props.router.values.page)
    let liquid = !!(this.props.router.values && this.props.router.values.liquid)
    let {
      drugs: { current }
    } = this.props
    return (
      <>
        <Menu className="bottom fixed menu three item huge main">
          <Menu.Item color='red' onClick={this.home}>
            Отмена
          </Menu.Item>
          <Menu.Item onClick={this.backward}>
            Назад
          </Menu.Item>
          <Menu.Item onClick={this.forward}>
            Далее
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper bottomMenu'>
          <Stepper />
        </div>

      </>
    );
  }
};
export default Clinrecs
