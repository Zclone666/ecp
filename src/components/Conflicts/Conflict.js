import React from 'react';

import { Transition, Message } from 'semantic-ui-react'

class AlertItem extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: true,
    }
  }
  close = () => {
    let {
      onClose
    } = this.props
    this.setState({ open: false }, () => {
      setTimeout(() => {
        onClose()
      }, 1000)
    })
  }
  componentDidMount(){
    let {
      sticky
    } = this.props
    if(!sticky){
      setTimeout(() => {
        this.close()
      }, 3000)
    }
  }
  render(){
    let {
      code,
      title,
      message,
      level,
      sticky
    } = this.props
    let {
      open
    } = this.state
    return (
      <Transition visible={open} animation='scale' duration={1000}>
        <Message
          className='tiny squared'
          onDismiss={this.close}
          success = {level === 'success'}
          error = {level === 'error'}
          info = {level === 'info'}
          warning = {level === 'warning'}
        >
          {title && <Message.Header>{title}</Message.Header>}
          <p>{message}</p>
        </Message>

      </Transition>
    )
  }

};
export default AlertItem
