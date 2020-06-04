import React from 'react';
import { inject, observer } from 'mobx-react';

import {
  Menu,
  List,
  Feed,
  Button,
  Responsive,
  Icon,
  Popup
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions')
@observer
class Drug extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: true,
    }
  }
  getLF = () => {
    let { drug } = this.props
    this.props.db.getLF(drug)
  }
  unselectDrug = () => {
    let { drug } = this.props
    this.props.db.unselectDrug(drug)
  }
  selectDrug = (e, drugId) => {
    e.preventDefault()
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups }
    } = this.props
    let selectedWarnings = warnings[drugId]
    let groups = []
    let drugs = []
    for( let key in selectedWarnings ){
      groups = _.unionWith(groups, [selectedWarnings[key].group], (a, b) => a === b);
      drugs = _.unionWith(drugs, [key], (a, b) => a === b);
    }
    // console.log({ groups, drugs });
    if( this.props.actions.selectedDrug === drugId ){
      this.props.actions.selectedDrug = null
      this.props.actions.selectedConflict = null
      this.props.actions.activeConflicts = []
      this.props.actions.activeDrugs = []
    }else{
      this.props.actions.selectedDrug = drugId
      this.props.actions.selectedConflict = null
      this.props.actions.activeConflicts = groups
      this.props.actions.activeDrugs = drugs
    }
    //return false
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups },
      drug
    } = this.props
    let selectedWarnings = warnings[selectedDrug]
    let { name, level, tn } = drug
    let currWarning = activeDrugs.includes(drug.id) && (selectedWarnings && warnGroups[selectedWarnings[drug.id].group] || warnGroups[selectedConflict])
    let hasWarning = warnings[drug.id] && !_.isEmpty(warnings[drug.id])
    let maxItem = _.maxBy(_.toArray(warnings[drug.id]), function(o){ return o.value; });
    let className = selectedDrug === drug.id ? 'selected' : ''
    className += (activeDrugs.length < 1 || activeDrugs.includes(drug.id) || selectedDrug === drug.id)  ? '' : ' unused'

    return(
      <List.Item className={className}>
        <List.Content floated='right'>
          {/*<Responsive fireOnMount as={Button.Group} vertical basic color='blue' maxWidth='480'>
            <Button icon>
              <Icon name='ellipsis horizontal' />
            </Button>
          </Responsive>
          */}
          <Responsive fireOnMount as={Button.Group} basic color='blue' minWidth='481'>
            <Button icon>
              <Icon name='tint' onClick={this.getLF} />
            </Button>
            <Button icon>
              <Icon name='font' />
            </Button>
            <Button icon>
              <Icon name='delete' onClick={this.unselectDrug} />
            </Button>
          </Responsive>
        </List.Content>
        {(currWarning && currWarning.valuecolor) ?
          <div className='left floated content arrowBg' style={{ backgroundColor: currWarning.valuecolor }} >
            <List.Icon
              name='arrow alternate circle right'
              style={{ color: '#FFF' }}
              size='large'
              onClick={() => this.setState({ selectedDrug: drug.id })}
            />
          </div>
          :
          <div className='left floated content arrowBg none'>
            <List.Icon
              name='arrow alternate circle right'
              style={{ color: '#FFF' }}
              size='large'
            />
          </div>
        }
        {hasWarning ?
          <List.Icon name='warning circle' style={{ color: maxItem.valuecolor }} size='large' onClick={(e) => this.selectDrug(e, drug.id)} />
          :
          <List.Icon name='warning circle' size='large' style={{ color: 'transparent', textShadow: 'unset' }} />
        }
        <Responsive as={List.Content} className='ui feed large' fireOnMount minWidth='481'>

            <Feed.Event>
              <Feed.Content>
                <Feed.Summary>
                  <span className='underlined'>{name}</span>{tn && <span><sup>TM</sup></span>}
                  <Feed.Date>внутривенное введение, 1 мл</Feed.Date>
                </Feed.Summary>
                <Feed.Meta>
                  р-р для в/в и в/м введ 0.1 % (1 мг/мл) (ампула 1 мл)
                </Feed.Meta>
              </Feed.Content>
            </Feed.Event>
        </Responsive>
        <Responsive
          as={Popup}
          maxWidth='480'
          trigger={
            <List.Content className='ui feed large'>
              <Feed.Event>
                <Feed.Content>
                  <Feed.Summary>
                    <span className='underlined'>{name}</span>{tn && <span><sup>TM</sup></span>}
                    <Feed.Date>внутривенное введение, 1 мл</Feed.Date>
                  </Feed.Summary>
                  <Feed.Meta>
                    р-р для в/в и в/м введ 0.1 % (1 мг/мл) (ампула 1 мл)
                  </Feed.Meta>
                </Feed.Content>
              </Feed.Event>
            </List.Content>
          }
          on='click'
          position='right'
        >
          <Popup.Content>
            <Menu secondary vertical>
              <Menu.Item onClick={this.getLF}>
                <Icon name='tint' />
                Дозировки
              </Menu.Item>
              <Menu.Item>
                <Icon name='font' />
                Аналоги
              </Menu.Item>
              <Menu.Item onClick={this.unselectDrug}>
                <Icon name='delete' />
                Убрать из списка
              </Menu.Item>
              <Menu.Item>
                <Icon name='ellipsis horizontal' />
                Подробнее
              </Menu.Item>
            </Menu>
          </Popup.Content>
        </Responsive>

      </List.Item>

    )
  }

};
export default Drug
