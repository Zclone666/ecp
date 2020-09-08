import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import BirthDate from '../../components/BirthDate'
import Search from '../../components/Search'


import {
  Sidebar,
  Menu,
  Icon,
  // Search,
  Segment,
  Message,
  List,
  Feed,
  Button,
  Responsive,
  Grid,
  Form,
  Input,
  Checkbox,
  Header,
  Dropdown
} from 'semantic-ui-react'

import _ from 'lodash';


@inject('router', 'diseases', 'actions')
@observer
class PatientForm extends Component {
  constructor(props){
    super(props)
    this.state = {
      search_disease: '',
      search_disease2: '',
      search_allergy: '',
    }
    //this.contextRef = createRef()
  }

  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }

    if( name === 'weight' || name === 'growth' ){
      this.props.actions.patientForm[name]=parseFloat(value)
    }else{
      this.props.actions.patientForm[name] = value
    }
    if( name === 'sex' && value !== 'woman' ){
      this.props.actions.patientForm.pregnancy = false
      this.props.actions.patientForm.gestation = null
      this.props.actions.patientForm.trimester = null
      this.props.actions.patientForm.lactation = false
    }
    if( name === 'trimester' ){
      this.props.actions.patientForm.gestation = null
    }
    if( name === 'gestation' ){
      this.props.actions.patientForm.trimester = value > 14 ? ( value > 26 ? 3 : 2) : 1
    }
    // console.log({ name, value, res: this.props.actions.patientForm[name] });
  }
  handleChangeToggle = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    this.props.actions.patientForm[name] = !this.props.actions.patientForm[name]
    if( name === 'pregnancy' && !this.props.actions.patientForm.pregnancy ){
      this.props.actions.patientForm.gestation = null
      this.props.actions.patientForm.trimester = null
    }
    //console.log({ name, value });
  }

  handleResultSelect = async (e, { name, result }) => {
    // console.log({ name, result });
    let newName = name === 'disease2' ? 'disease' : name
    await this.props.actions.selectPatient(result, newName)
    this.setState({ [`search_${name}`]: '' })
  }
  handleResultUnselect = async ( name, result ) => {
    // console.log({ name, result });
    let newName = name === 'disease2' ? 'disease' : name
    await this.props.actions.unselectPatient(result, newName)
    this.forceUpdate()
    // this.setState({ [`search_${name}`]: '' })
  }

  handleSearchChange = (e, { name, value }) => {
    this.setState({ [`search_${name}`]: value })
    if(value.length > 1){
      this.props.diseases.searchReady = false
      if( name === 'allergy' ){
        this.props.diseases.getSearchAllergy(value, name)
      }else{
        this.props.diseases.getSearchDisease(value, name)
      }

    }

  }

  resultRenderer = ({ name, level, tn, type }) => {
    return <div>{name}{type === 'TN' && <sup>TM</sup>}</div>
  }
  get disease(){
    const {
      disease,
    } = this.props.actions.patientForm
    let arr = []
    disease.forEach((item, i) => {
      if(item.main) arr.push(item)
    });
    return arr
  }
  get disease2(){
    const {
      disease,
    } = this.props.actions.patientForm
    let arr = []
    disease.forEach((item, i) => {
      if(!item.main) arr.push(item)
    });
    return arr
  }
  render() {
    const {
      birthdate,
      age,
      sex,
      growth,
      weight,
      disease,
      pregnancy,
      gestation,
      trimester,
      lactation,
      driving,
      allergy
    } = this.props.actions.patientForm
    let { diseaseRows, allergyRows } = this.props.diseases
    let { search_disease, search_disease2, search_allergy } = this.state
    let searchReady = true, searchRows=[], searchQuery=''

    let isWoman = sex === 'woman'
    let isPregant = !!pregnancy

    return (
      <Segment basic>
        <Form>
          <Form.Group>
            <BirthDate name='birthdate' value={birthdate} onChange={this.handleChange} />
            <Form.Field>
              <label>Пол</label>
              <Button.Group size='big'>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>Мужчина</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>Женщина</Button>
              </Button.Group>
            </Form.Field>
          </Form.Group>
          <Form.Group widths={2}>
            <Form.Field>
              <label>Рост</label>
              <Input
                size='big'
                name='growth'
                value={growth || ''}
                label={{ basic: true, content: 'см' }}
                labelPosition='right'
                placeholder='178.5'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Вес</label>
              <Input
                size='big'
                name='weight'
                value={weight || ''}
                label={{ basic: true, content: 'кг' }}
                labelPosition='right'
                placeholder='60.5'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths={1}>
            <Form.Field width={16}>
              <label>Основное заболевание</label>
              <Search
                fluid
                size='big'
                name='disease'
                loading={!searchReady}
                onResultSelect={this.handleResultSelect}
                onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  leading: true,
                })}
                results={diseaseRows}
                value={search_disease}
                resultRenderer={this.resultRenderer}
                resultClassName='result-wrapper'
              />
            </Form.Field>

          </Form.Group>
          <List divided verticalAlign='middle'>
            {this.disease.map((item, i) => {
              return(
                <List.Item key={'disease'+i}>
                  <List.Content floated='right'>
                    <Button icon='delete' onClick={() => this.handleResultUnselect('disease', item)}/>
                  </List.Content>
                  <List.Content>{item.name}</List.Content>
                </List.Item>
              )
            })}
          </List>
          <Form.Group widths={1}>
            <Form.Field width={16}>
              <label>Сопутствующие заболевания</label>
              <Search
                fluid
                size='big'
                name='disease2'
                loading={!searchReady}
                onResultSelect={this.handleResultSelect}
                onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  leading: true,
                })}
                results={diseaseRows}
                value={search_disease2}
                resultRenderer={this.resultRenderer}
                resultClassName='result-wrapper'
              />
            </Form.Field>
          </Form.Group>
          <List divided verticalAlign='middle'>
            {this.disease2.map((item, i) => {
              return(
                <List.Item key={'disease2'+i}>
                  <List.Content floated='right'>
                    <Button icon='delete' onClick={() => this.handleResultUnselect('disease2', item)}/>
                  </List.Content>
                  <List.Content>{item.name}</List.Content>
                </List.Item>
              )
            })}
          </List>
          <Form.Group widths={1}>
            <Form.Field width={16}>
              <label>Аллергия</label>
              <Search
                fluid
                size='big'
                name='allergy'
                loading={!searchReady}
                onResultSelect={this.handleResultSelect}
                onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  leading: true,
                })}
                results={allergyRows}
                value={search_allergy}
                resultRenderer={this.resultRenderer}
                resultClassName='result-wrapper'
              />
            </Form.Field>
          </Form.Group>
          <List divided verticalAlign='middle'>
            {allergy.map((item, i) => {
              return(
                <List.Item key={'allergy'+i}>
                  <List.Content floated='right'>
                    <Button icon='delete' onClick={() => this.handleResultUnselect('allergy', item)}/>
                  </List.Content>
                  <List.Content>{item.name}</List.Content>
                </List.Item>
              )
            })}
          </List>
          {isWoman &&
            <Responsive as={Form.Group} widths={'equal'} maxWidth={480}>
              <Form.Field>
                <Button
                  size='big'
                  icon
                  fluid
                  labelPosition='left'
                  primary={!!pregnancy}
                  onClick={this.handleChangeToggle}
                  name='pregnancy'
                  value='pregnancy'
                >
                  <Icon name={!!pregnancy ? 'check square' : 'square outline'} />
                  Беременность
                </Button>
              </Form.Field>
              <Form.Field>
                <Button.Group size='big' fluid>
                  <Button
                    disabled
                    active
                  >
                    Триместр
                  </Button>
                  <Button
                    primary={trimester == 1}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={1}
                  >
                    1
                  </Button>
                  <Button
                    primary={trimester == 2}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={2}
                  >
                    2
                  </Button>
                  <Button
                    primary={trimester == 3}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={3}
                  >
                    3
                  </Button>
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <Dropdown
                  className='big'
                  disabled={!isPregant}
                  name='gestation'
                  onChange={this.handleChange}
                  button
                  fluid
                  search
                  floating
                  options={_.map(Array(44), (item, i) => {
                    return {
                      key: i+1,
                      text: i+1,
                      value: i+1
                    }
                  })}
                  text={'Неделя ' + (gestation || '')}
                />
              </Form.Field>
            </Responsive>
          }

          <Responsive as={Form.Group} widths={'equal'} maxWidth={480}>
            <Form.Field>
              <Button
                size='big'
                icon
                fluid
                labelPosition='left'
                primary={!!driving}
                onClick={this.handleChangeToggle}
                name='driving'
                value='driving'
              >
                <Icon name={!!driving ? 'check square' : 'square outline'} />
                Вождение авто
              </Button>
            </Form.Field>
            <Form.Field>
              <Button
                size='big'
                disabled={!isWoman}
                icon
                fluid
                labelPosition='left'
                primary={!!lactation}
                onClick={this.handleChangeToggle}
                name='lactation'
                value='lactation'
              >
                <Icon name={!!lactation ? 'check square' : 'square outline'} />
                Кормление грудью
              </Button>
            </Form.Field>
          </Responsive>
          {isWoman &&
            <Responsive as={Form.Group} minWidth={481}>
              <Form.Field>
                <Button
                  size='big'
                  icon
                  labelPosition='left'
                  primary={!!pregnancy}
                  onClick={this.handleChangeToggle}
                  name='pregnancy'
                  value='pregnancy'
                >
                  <Icon name={!!pregnancy ? 'check square' : 'square outline'} />
                  Беременность
                </Button>
              </Form.Field>
              <Form.Field>
                <Button.Group size='big' fluid>
                  <Button
                    disabled
                    active
                  >
                    Триместр
                  </Button>
                  <Button
                    primary={trimester == 1}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={1}
                  >
                    1
                  </Button>
                  <Button
                    primary={trimester == 2}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={2}
                  >
                    2
                  </Button>
                  <Button
                    primary={trimester == 3}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={3}
                  >
                    3
                  </Button>
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <Dropdown
                  className='big'
                  disabled={!isPregant}
                  name='gestation'
                  onChange={this.handleChange}
                  button
                  floating
                  search
                  options={_.map(Array(44), (item, i) => {
                    return {
                      key: i+1,
                      text: i+1,
                      value: i+1
                    }
                  })}
                  text={'Неделя ' + (gestation || '')}
                />
              </Form.Field>
            </Responsive>
          }
          <Responsive as={Form.Group} minWidth={481}>
            <Form.Field>
              <Button
                size='big'
                icon
                labelPosition='left'
                primary={!!driving}
                onClick={this.handleChangeToggle}
                name='driving'
                value='driving'
              >
                <Icon name={!!driving ? 'check square' : 'square outline'} />
                Вождение авто
              </Button>
            </Form.Field>
            <Form.Field>
              <Button
                size='big'
                disabled={!isWoman}
                icon
                labelPosition='left'
                primary={!!lactation}
                onClick={this.handleChangeToggle}
                name='lactation'
                value='lactation'
              >
                <Icon name={!!lactation ? 'check square' : 'square outline'} />
                Кормление грудью
              </Button>
            </Form.Field>
          </Responsive>
        </Form>
      </Segment>
    );
  }
};
export default PatientForm
