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
import { withTranslation } from "react-i18next";
import _ from 'lodash';

const Dozes = inject('router', 'db', 'actions', 'drugs', 'warnings')(observer(class Dozes extends Component {
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
      drugs: { setDosageParams, getLiquidParams },
      router: { values }
    } = this.props
    await setDosageParams()
    if(values && values.liquid && parseInt(values.liquid) > 0){
      await getLiquidParams()
    }

    this.back()
    // let current = drugsDosages.data.get(currDrug.key) || {};
    // drugsDosages.data.set( currDrug.key, _.extend(current, { ...current, url: location.pathname }) );

  }

  back = () => {
    let isLiquid = this.props.router.match.name === 'liquid'
    let liquid = this.props.router.values.liquid
    this.props.router.push(isLiquid ? `/liquid/calc/${liquid}` : '/')
    this.props.actions.stepsData = {
      key: null,
      way: null,
      step: null,
      form: null,
      method: null,
      pack: {},
      dosage: [],
      value: null,
      helpers: {}
    }
    this.props.drugs.current = {}
  };

  render() {
    const { t } = this.props;
    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
          {t("back")}
          </Menu.Item>
          <Menu.Item onClick={this.saveDoze}>
          {t("save")}
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper bottomMenu'>
          <Stepper />
        </div>

      </>



    );
  }
}));

export default withTranslation()(Dozes)
