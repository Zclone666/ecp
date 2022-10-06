import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a'
import {
  Grid,
  Card,
  Icon,
  Segment,
  Responsive
} from 'semantic-ui-react'
import { withTranslation } from "react-i18next";
// import _ from 'lodash';

const WayChoice = inject('db', 'actions', 'drugs', 'warnings', 'router')(observer(class WayChoice extends Component {
  constructor(props) {
    super(props)
    this.state = {
      viewType: 0
    }
  }
  handleOnUpdate = (event, data) => {
    // console.log({event, data});
    if (data.width > 479) {
      this.setState({ viewType: 'columns' })
    } else {
      this.setState({ viewType: 'rows' })
    }
  }
  render() {
    let {
      router: { values }
    } = this.props
    const { t } = this.props.actions;
    let url = !values.liquid ? '/concept/dozes' : `/liquid/calc/${values.liquid}/dozes`
    let { viewType } = this.state

    return (
      <Responsive className='h100' as={Grid} fireOnMount columns='equal' onUpdate={this.handleOnUpdate}>
        {viewType === 'columns' ?
          <Grid.Row stretched>
            <Grid.Column width={8}>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid href as={RouterLink} to={`${url}/lf/1`}>
                      <div className='ui image cardbg'>
                        <Icon name='pills' className='rotated' />
                        <Icon name='pills' />
                      </div>
                      <Card.Content>
                        <Card.Header>{t("dosage_form")}</Card.Header>
                        <Card.Meta>{t("choose_dosage_form_method")}</Card.Meta>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
            <Grid.Column width={8}>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid href as={RouterLink} to={`${url}/methods/1`}>
                      <div className='ui image cardbg'>
                        <Icon name='syringe' className='rotated' />
                        <Icon name='syringe' />
                      </div>
                      <Card.Content>
                        <Card.Header>{t("mode_application")}</Card.Header>
                        <Card.Meta>{t("choose_method_dosage_form")}</Card.Meta>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          :
          <Grid.Row stretched>
            <Grid.Column width={16}>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid href as={RouterLink} to={`${url}/lf/1`}>
                      <div className='ui image cardbg'>
                        <Icon name='pills' className='rotated' />
                        <Icon name='pills' />
                      </div>
                      <Card.Content>
                        <Card.Header>{t("dosage_form")}</Card.Header>
                        <Card.Meta>{t("choose_dosage_form_method")}</Card.Meta>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid href as={RouterLink} to={`${url}/methods/1`}>
                      <div className='ui image cardbg'>
                        <Icon name='syringe' className='rotated' />
                        <Icon name='syringe' />
                      </div>
                      <Card.Content>
                        <Card.Header>{t("mode_application")}</Card.Header>
                        <Card.Meta>{t("choose_method_dosage_form")}</Card.Meta>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        }
      </Responsive>
    )
  }

}));

export default withTranslation()(WayChoice)
