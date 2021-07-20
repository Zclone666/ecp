import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import Dozes from '../Dozes';
import Patient from '../Patient';
import Profile from '../Profile';
import Clinics from '../Clinics';
import Warning from '../Warning';
import Recipe from '../Recipe';
import Prescript from '../Prescript';
import Analog from '../Analog';
import DrugInfo from '../DrugInfo';
import Liquid from '../Liquid';
import Clinrecs from '../Clinrecs';

@inject('router', 'actions')
@observer
class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: '',
    };
    //this.contextRef = createRef()
  }

  saveDoze = () => {};

  back = () => {
    this.props.router.push('/');
  };

  render() {
    let page = (this.props.router.values && this.props.router.values.page) || 'none';
    let name = (this.props.router && this.props.router.match && this.props.router.match.name) || 'none';
    return (
      {
        concept: <Dozes />,
        patient: <Patient />,
        profile: <Profile />,
        clinics: <Clinics />,
        warning: <Warning />,
        recipe: <Recipe />,
        prescript: <Prescript />,
        analog: <Analog />,
        druginfo: <DrugInfo />,
        liquid: <Liquid />,
        clinrec: <Clinrecs />,
        none: <div />,
      }[name] || null
    );
  }
}
export default Page;
