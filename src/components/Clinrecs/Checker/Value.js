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
    if(
      value === '' ||
      value === 0 ||
      value === '0' ||
      value === '.' ||
      value.split('.')[1] === ''
    ) {
      onChange({ name, value: value })
    }else{
      onChange({ name, value: parseFloat(value) })
    }

  }
  render(){
    let { title, name, value, unit } = this.props
    return (
      <List.Item>
        <Form>
          <Form.Field>
            <label>{title}</label>
            {unit ?
              <Input
                label={{ basic: true, content: unit }}
                labelPosition='right'
                name={name}
                onChange={this.handleChange}
                placeholder={title}
                value={value}
              />
              :
              <Input
                name={name}
                onChange={this.handleChange}
                placeholder={title}
                value={value}
              />
            }

          </Form.Field>
        </Form>
      </List.Item>
    )
  }

};
