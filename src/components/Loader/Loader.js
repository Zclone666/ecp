import React from 'react';
import {
  Dimmer,
  Icon
} from 'semantic-ui-react';

export default class Loader extends React.Component {

  render(){
    const open = this.props.open === false ? false : true
    return (
      <Dimmer active={open} inverted>
        <img src='/loader.png' className='loader' /> 
      </Dimmer>
    )
  }

};
