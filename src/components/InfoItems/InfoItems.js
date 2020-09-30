import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

// import RouterLink from '../../../router/a'

import {
  // Menu,
  List,
  Transition,
  Button,
  Icon,
  Segment,
  Label,
  Table,
  Dimmer,
  Header,
  Feed
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'druginfo', 'router', 'drugs')
@observer
class InfoItems extends Component {
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

  renderHtml = (item) => {
    return(
      <Segment basic dangerouslySetInnerHTML={{__html: item.text}}></Segment>
    )
  }
  renderList = (item) => {
    return (
      <Segment basic>
        <Feed>
          {item.items && item.items.map(( listitem, i ) => {
            return(
              <Feed.Event key={'infoItem'+i}>
                <Feed.Content>
                  {listitem.bold ? 
                    <Feed.Summary style={{ fontWeight: 700 }}>
                      {listitem.text}
                    </Feed.Summary>
                    :
                    <Feed.Summary style={{ fontWeight: 700 }}>
                      {listitem.code} <span style={{ fontWeight: 'normal' }}>{listitem.text}</span>
                    </Feed.Summary>
                  }
                </Feed.Content>
              </Feed.Event>
            )
          })}
        </Feed>
      </Segment>
    )
  }
  renderText = (item) => {
    return(
      <Segment basic>{item.text}</Segment>
    )
  }
  renderTree = (item) => {

  }
  
  render(){
    let {
      druginfo, router
    } = this.props
    let { opened } = this.state
    let drugKey = router.values && router.values.page
    let infoObj = druginfo.info.get(drugKey) || {}
    return (
      <>
      {(druginfo.ready && infoObj.items.length > 0) && (<Segment basic>
        <List divided relaxed verticalAlign='middle' size='large' >
          {infoObj.items.map(( item, i ) => {

            return(
              <>
                <List.Item
                  key={'info'+i}
                  onClick={() => this.collapse(i)}
                >
                  <List.Content className='large'>
                    <List.Header>{item.title}</List.Header>

                  </List.Content>
                  <Transition.Group animation={'slide down'} duration={300}>
                    {i === opened && (
                      {
                        'string': this.renderText(item),
                        'list': this.renderList(item),
                        'tree': this.renderTree(item),
                        'html': this.renderHtml(item),
                      }[item.type]
                    )}
                  </Transition.Group>
                </List.Item>
              </>
            )

          })}         
        </List>
        
      </Segment>)}
      {(druginfo.ready && infoObj.items.length < 1) && 
        <Dimmer.Dimmable as={Segment} basic dimmed={true} className='h100'>
          <Dimmer active={true} inverted>
            <Header as='h2' icon color='grey'>
              <Icon name='dont' />
              Нет информации
            </Header>
          </Dimmer>
        </Dimmer.Dimmable>
      }
      </>
    )
  }

};
export default InfoItems
