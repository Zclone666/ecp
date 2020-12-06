import React from 'react';
import {
  Checkbox,
  List
} from 'semantic-ui-react';

export default class Binary extends React.Component {

  render(){
    let { name, value } = this.props
    return (
      <List.Item>
        <Checkbox checked={!!value} label={name} />
      </List.Item>
    )
  }

};
