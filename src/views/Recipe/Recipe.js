import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import Drugs from '../../components/Drugs'

import {
  // Sidebar,
  Menu,
  Tab,
  Statistic
  // Icon,
  // Search,
  // Segment,
  // Message,
  // List,
  // Feed,
  // Button,
  // Responsive,
  // Grid
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class Recipe extends Component {
  constructor(props){
    super(props)
    this.state = {
      activeIndex: 0
    }
    //this.contextRef = createRef()
  }

  errorReport = () => {


  }

  back = () => {
    this.props.router.push('/')
  };

  handleTabChange = (e, { activeIndex }) => {
    this.setState({ activeIndex })
  }

  render() {
    let {
      activeIndex
    } = this.state

    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item onClick={this.errorReport}>
            Отправить
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper'>
          <Drugs isRecipe={true} />
        </div>

      </>



    );
  }
};
export default Recipe
