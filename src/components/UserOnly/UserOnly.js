import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Loader from '../Loader'

@inject('router', 'actions')
@observer
class UserOnly extends Component {
  render(){
    let {
      children,
      actions: { authorized },
      router: { match }
    } = this.props;
    return (
      authorized && match.name !== 'auth' ?
        children
        :
        (match.name === 'auth' ?
          match.render
          :
          <Loader />
        )
    )
  }

};
export default UserOnly
