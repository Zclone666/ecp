import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import { List, Icon, Form, Segment, Input, Button, Dropdown, Responsive, Checkbox } from "semantic-ui-react";

import Day from "./Day";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const Schedule = inject("db", "actions", "router", "drugs", "dosages")(observer(class Schedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dosage: 0,
      count: 0,
      fullDosage: 0,
      weight: 0,
      weightDosage: 0,
    };
  }
  handleChange = (e, { name, value }) => {
    if (!name && !value) {
      let { name, value } = e.target;
    }
    // console.log({ name, value });
  };
  render() {
    let {
      actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts, stepsData },
      dosages: {
        current: { drug, form, methodform, names },
      },
      router: { values },
    } = this.props;
    let {t} = this.props.actions;

    let weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    return (
      <Form.Group>
        <Form.Field className="fluid">
          <label>{t("choose_days_week")}:</label>
          <Checkbox
            label={t("daily")}
            onChange={() => this.handleChange(null, { name: "all" })}
            checked={this.state.checked}
          />
          <Responsive as={Segment.Group} horizontal fluid widths={7} minWidth={768}>
            {weekdays.map((day, i) => {
              return <Day day={day} index={i} key={"day" + i} onChange={this.handleChange} />;
            })}
          </Responsive>
          <Responsive as={Segment.Group} vertical fluid maxWidth={767}>
            {weekdays.map((day, i) => {
              return <Day day={day} index={i} key={"day" + i} onChange={this.handleChange} />;
            })}
          </Responsive>
        </Form.Field>
      </Form.Group>
    );
  }
}));

export default withTranslation()(Schedule);
