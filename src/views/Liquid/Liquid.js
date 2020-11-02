import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Dozes from '../Dozes'

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


@inject('router', 'db', 'actions', 'drugs', 'warnings')
@observer
class Liquid extends Component {
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
      drugs: { setDosageParams },
      router: { location }
    } = this.props
    await setDosageParams(location.pathname)
    this.props.router.push('/')
    // let current = drugsDosages.data.get(currDrug.key) || {};
    // drugsDosages.data.set( currDrug.key, _.extend(current, { ...current, url: location.pathname }) );

  }

  back = () => {
    this.props.router.push('/')
    // this.props.actions.stepsData = {
    //   key: null,
    //   way: null,
    //   step: null,
    //   form: null,
    //   method: null,
    //   pack: {},
    //   dosage: {},
    // }
  };

  render() {
    let showPage = !!(this.props.router.values && this.props.router.values.page)
    let liquid = !!(this.props.router.values && this.props.router.values.liquid)
    return (
      <Sidebar.Pushable>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item onClick={this.saveDoze}>
            Сохранить
          </Menu.Item>
        </Menu>
        <Sidebar
          width='very wide'
          direction='right'
          animation='overlay'
          visible={showPage}
          vertical
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Dozes />
        </Sidebar>
        <Sidebar.Pusher dimmed={showPage} className='pusherwrapper'>
          <div className='scrollwrapper bottomMenu'>
            {liquid && <Stepper isLiquid/>}
          </div>
        </Sidebar.Pusher>
      </Sidebar.Pushable>



    );
  }
};
export default Liquid
