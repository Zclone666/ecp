import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import {
  Sidebar,
  Menu,
  Icon,
  Segment,
  Header,
  Item,
  Button,
  Label,
  Image,
  Grid,
  Divider,
  Dropdown,
  Dimmer,
  Comment,
  Step,
  Statistic,
  Flag,
  Input,
  Sticky
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class Main extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
      openChartSettings: false,
      currentTable: null
    }
    this.contextRef = createRef()
  }

  logout = () => {
    this.props.actions.logout()
  }

  handleSidebar = () => {
    this.setState({ open: !this.state.open })
  };

  render() {
    const { open } = this.state
    let { currentPage } = this.props.actions
    let visible = true
    return (
      <>
        <Menu className="ui top huge borderless tabular nomargin main menu fixed grey">

          <Menu.Item icon onClick={this.handleSidebar}>
            <Icon size='large' name='content' />
          </Menu.Item>


          <Menu.Menu position='right'>
            <Menu.Item onClick={this.logout}>
                Выход
            </Menu.Item>
          </Menu.Menu>

        </Menu>

        <Sidebar.Pushable>
          <Sidebar animation='overlay' visible={open} as={Menu} vertical size='huge'>

            <Menu.Item onClick={this.logout}>
              <Icon name='sign-out' />
              Выход
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher dimmed={open}>
            <div className='flex-column'>


            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>

      </>



    );
  }
};
export default Main
