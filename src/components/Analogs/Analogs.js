import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

// import RouterLink from '../../../router/a'

import {
  // Menu,
  List,
  Transition,
  // Button,
  Icon,
  Segment,
  Label,
  Table,
  Dimmer,
  Header
} from 'semantic-ui-react'

// import _ from 'lodash';

const Analogs = inject('db', 'actions', 'analogs', 'router', 'drugs')(observer(class Analogs extends Component {
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
  setAnalog = async ({id, drug}) => {
    // console.log({id, drug});
    let {
      router
    } = this.props
    drug.fpid = id
    drug.key = null
    drug.helpers = {
      dosage: { short: '', full: '', id: null },
      pack: { short: '', full: '', id: null },
      type: 'simple',
      url: '',
      key: null,
      way: 'lf',
      step: 4,
      mnn: false,
      drugCache: null
    }
    let drugKey = router.values && router.values.page
    await this.props.drugs.unselectDrug({ key: drugKey })
    await this.props.drugs.selectFromSearch( drug )

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
      <>
      {(analogs.ready && analogObj.arr.length > 0) && (<Segment basic>
        <List divided relaxed verticalAlign='middle' size='large' >
          {analogObj.arr.map(( analog, i ) => {

            return(
              <>
                <List.Item
                  key={'analog'+i}
                  onClick={() => this.collapse(analog.id)}
                >

                  <List.Content floated='right'>
                    {analog.min && <Label color='green'>{analog.min} ₽</Label>}
                    {analog.max && <Label color='orange'>{analog.max} ₽</Label>}
                  </List.Content>
                  <List.Content className='large'>
                    <List.Header>{analog.name}{analog.drug.type === 'TN' && <span><sup>TM</sup></span>}</List.Header>

                  </List.Content>
                  <Transition.Group animation={'slide down'} duration={300}>
                    {analog.id === opened && (
                      <Table basic='very' collapsing selectable>
                        <Table.Body>

                        {analog.arr && analog.arr.map(( analogItem, x ) => {
                          return(
                            <Table.Row
                              key={'analogItem'+x}
                              onClick={() => this.setAnalog({ drug: analog.drug, id: analogItem.id })}
                            >
                              <Table.Cell>{analogItem.name}</Table.Cell>
                              <Table.Cell collapsing textAlign='right'>
                                {analogItem.min && <Label color='green'>{analogItem.min} ₽</Label>}
                              </Table.Cell>
                              <Table.Cell collapsing>
                                {analogItem.max && <Label color='orange'>{analogItem.max} ₽</Label>}
                              </Table.Cell>
                            </Table.Row>

                          )
                        })}
                      </Table.Body>
                    </Table>
                    )}
                  </Transition.Group>
                </List.Item>
              </>
            )

          })}
        </List>

      </Segment>)}
      {(analogs.ready && analogObj.arr.length < 1) &&
        <Dimmer.Dimmable as={Segment} basic dimmed={true} className='h100'>
          <Dimmer active={true} inverted>
            <Header as='h2' icon color='grey'>
              <Icon name='dont' />
              Нет аналогов
            </Header>
          </Dimmer>
        </Dimmer.Dimmable>
      }
      </>
    )
  }

}));

export default Analogs
