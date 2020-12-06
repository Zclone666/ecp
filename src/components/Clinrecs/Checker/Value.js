import React from 'react';
import {
  List,
  Form,
  Input
} from 'semantic-ui-react';

export default class Value extends React.Component {

  render(){
    let { name, value } = this.props
    return (
      <List.Item>
        <Form>
          <Form.Field>
            <label>{name}</label>
            <Input placeholder={name} value={value} />
          </Form.Field>
        </Form>
      </List.Item>
    )
  }

};
