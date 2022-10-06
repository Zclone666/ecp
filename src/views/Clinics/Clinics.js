import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import { Segment, List, Button } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
const Clinics = inject("router", "db", "actions", "patients")(observer(class Clinics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,

      step: 0,

      isLoading: false,
      searchQuery: "",
    };
    this.sliderRef = createRef();
  }

  back = () => {
    this.props.router.push("/");
  };
  chose = async ({ id, name }) => {
    // this.props.actions.loading = true
    this.props.actions.drugStructure.clinic_id = id;
    this.props.actions.drugStructure.clinic_name = name;
    this.props.router.push("/");
    // this.props.actions.loading = false
  };
  render() {
    let {
      actions: {
        checkData,
        drugStructure: { clinic_id },
      },
    } = this.props;
    const { t } = this.props.actions;
    return (
      <Segment basic>
        <List divided relaxed verticalAlign="middle" size="large">
          {checkData.lpu.map((lpu, i) => {
            return (
              <List.Item key={"analog" + i} onClick={() => this.chose(lpu)}>
                <List.Content floated="right">
                  <Button>{t("select")}</Button>
                </List.Content>
                <List.Icon
                  name={clinic_id === lpu.id ? "check square outline" : "square outline"}
                  verticalAlign="middle"
                />
                <List.Content className="large">
                  <List.Header>{lpu.name}</List.Header>
                </List.Content>
              </List.Item>
            );
          })}
        </List>
      </Segment>
    );
  }
}));

export default withTranslation()(Clinics);
