import React from 'react';
import {
  List,
  Form,
  Input
} from 'semantic-ui-react';

export default class Value extends React.Component {
  handleChange = (e, {name, value}) => {
    let { onChange } = this.props
    if( !name && !value ){
      let { name, value } = e.target
    }
    onChange({ name, value: parseFloat(value) })
  }
  render(){
    let { title, name, value } = this.props
    return (
      <List.Item>
        <Form>
          <Form.Field>
            <label>{title}</label>
            <Input name={name} onChange={this.handleChange} placeholder={title} value={value} />
          </Form.Field>
        </Form>
      </List.Item>
    )
  }

};
