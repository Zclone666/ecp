import React from 'react';
import {
  Checkbox,
  List
} from 'semantic-ui-react';

export default class Binary extends React.Component {
  handleChange = (e, {name}) => {
    let { onChange } = this.props
    if( !name ){
      let { name } = e.target
    }
    let { value } = this.props

    onChange({ name, value: !!value ? 0 : 1 })
  }
  render(){
    let { title, name, value } = this.props
    return (
      <List.Item>
        <Checkbox checked={!!value} onChange={this.handleChange} name={name} label={title} />
      </List.Item>
    )
  }

};
