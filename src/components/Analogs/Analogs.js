import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

// import RouterLink from '../../../router/a'

import {
  // Menu,
  List,
  Transition,
  Button,
  Icon
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'analogs', 'router', 'drugs')
@observer
class Analogs extends Component {
  constructor(props){
    super(props)


    this.state = {
      opened: null
    }
  }

  collapse = (opened) => {
    if(this.state.opened === opened){
      this.setState({ opened: null })
    }else{
      this.setState({ opened })
    }
  }
  setAnalog = async (id) => {
    let {
      router
    } = this.props
    let drugKey = router.values && router.values.page
    await this.props.drugs.setFP( drugKey, id )
    router.push('/')
  }

  render(){
    let {
      analogs, router
    } = this.props
    let { opened } = this.state
    let drugKey = router.values && router.values.page
    let analogObj = analogs.analog.get(drugKey) || {}
    return (
      <List animated divided selection verticalAlign='middle' size='large' >
        {analogs.ready && analogObj.arr.map(( analog, i ) => {

          return(
            <>
              <List.Item
                key={'analog'+i}
                onClick={() => this.collapse(analog.id)}
              >


                <List.Content className='large'>
                  <List.Header>{analog.name}</List.Header>
                  <Transition.Group animation={'slide down'} duration={300}>
                    {analog.id === opened && (
                      <List.List>
                        {analog.arr && analog.arr.map(( analogItem, x ) => {
                          return(
                            <List.Item
                              key={'analogItem'+x}
                              onClick={() => this.setAnalog(analogItem.id)}
                            >
                              <List.Content className='large'>
                                <List.Description>{analogItem.name}</List.Description>

                              </List.Content>

                            </List.Item>
                          )
                        })}
                      </List.List>
                    )}

                  </Transition.Group>
                </List.Content>

              </List.Item>

            </>
          )

        })}
      </List>

    )
  }

};
export default Analogs
