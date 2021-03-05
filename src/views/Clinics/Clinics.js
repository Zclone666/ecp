import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Slider from "react-slick";

import { Segment, List, Button } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "patients")
@observer
class Clinics extends Component {
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
      patients,
      actions: {
        checkData,
        drugStructure: { clinic_id },
      },
    } = this.props;
    return (
      <Segment basic>
        <List divided relaxed verticalAlign="middle" size="large">
          {checkData.lpu.map((lpu, i) => {
            return (
              <>
                <List.Item key={"analog" + i} onClick={() => this.chose(lpu)}>
                  <List.Content floated="right">
                    <Button>Выбрать</Button>
                  </List.Content>
                  <List.Icon
                    name={clinic_id == lpu.id ? "check square outline" : "square outline"}
                    verticalAlign="middle"
                  />
                  <List.Content className="large">
                    <List.Header>{lpu.name}</List.Header>
                  </List.Content>
                </List.Item>
              </>
            );
          })}
        </List>
      </Segment>
    );
  }
}
export default Clinics;
