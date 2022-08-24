import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { List, Menu, Responsive, Segment, Checkbox, Popup, Icon, Header, Message } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const ClinrecStartPage = inject(
  "actions",
  "clinrecs",
  "patients",
  "router"
)(
  observer(
    class ClinrecStartPage extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          checked: {},
          start: false,
        };
      }

      clearChecked = () => {
        this.setState({ checked: {} });
      };

      proceedToClinrecs = () => {
        const { clinrecCheckerStep } = this.props.actions;
        this.props.clinrecs.clinrecSelect = [];
        //
        // if (this.props.patients.current) {
        //   for (const [key, value] of Object.entries(this.state.checked)) {
        //     if (value && !this.props.clinrecs.diseaseSelect.find((d) => d.id === value.id)) {
        //       this.props.clinrecs.diseaseSelect.push(value);
        //     }
        //   }
        // }
        _.keys(this.state.checked).forEach((item, i) => {
          if (this.state.checked[item]) this.props.clinrecs.clinrecSelect.push(this.state.checked[item].id);
        });

        this.props.clinrecs.check(false);
        this.props.router.push(`/clinrec/checker/${clinrecCheckerStep}`);
      };

      renderTree = (sick) => {
        // console.log(sick.name, _.keys(sick.clinicalreference));
        if ((sick.clinicalreference && _.keys(sick.clinicalreference).length) || sick.items?.length) {
          return (
            <List.Item style={{ height: "100%" }} key={sick.id}>
              <List.Icon name="circle" size="small" />
              <List.Content>
                <List.Description>{sick.name}</List.Description>
                {sick.items?.length > 0 && (
                  <List.List>
                    {sick.items.map((item) => {
                      return this.renderTree(item);
                    })}
                  </List.List>
                )}
                {sick.clinicalreference && _.keys(sick.clinicalreference).length
                  ? _.keys(sick.clinicalreference).map((id) => {
                      let item = { id, ...sick.clinicalreference[id] };
                      return this.renderClinrec(item);
                    })
                  : sick.items?.length == 0 && <Message size="tiny">Нет доступных клинреков</Message>}
              </List.Content>
            </List.Item>
          );
        } else return null;
      };

      renderClinrec = (clinrec) => {
        // console.log({ clinrec });
        return (
          <List.Item style={{ height: "100%" }} key={clinrec.id}>
            <List.Content className="large">
              <List.Description>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Checkbox
                    onChange={() => {
                      if (this.state.checked[clinrec.id])
                        this.setState({ checked: { ...this.state.checked, [clinrec.id]: null } });
                      else
                        this.setState({
                          checked: {
                            ...this.state.checked,
                            [clinrec.id]: {
                              id: clinrec.id,
                              name: clinrec.name,
                            },
                          },
                        });
                    }}
                    checked={!!this.state.checked[clinrec.id]}
                    style={{ marginRight: "5px", fontSize: 16 }}
                    label={
                      <label>
                        <strong>{clinrec.name}</strong> {clinrec.source}
                      </label>
                    }
                  />
                </div>
              </List.Description>
            </List.Content>
          </List.Item>
        );
      };

      render() {
        const { t } = this.props.actions;
        // console.log("state: ", this.state);
        const { clinicalGuidelinesExist } = this.props.clinrecs;
        const diseases = this.props.patients.current.disease
          .map((d) => d.id)
          .concat(this.props.patients.current.co_disease.map((d) => d.id));

        const disabled = !_.findKey(this.state.checked, function (o) {
          return o;
        });

        return (
          <>
            <Menu className="bottom fixed menu three item huge main">
              <Menu.Item onClick={() => this.props.router.push("/")}>{t("back")}</Menu.Item>
              <Menu.Item disabled={disabled} onClick={this.clearChecked}>
                {t("clear_all")}
              </Menu.Item>
              {disabled ? (
                <Popup
                  position="top center"
                  trigger={
                    <Menu.Item disabled={disabled} onClick={this.proceedToClinrecs}>
                      {t("apply")}
                    </Menu.Item>
                  }
                >
                  Выберите хотя бы один вариант
                </Popup>
              ) : (
                <Menu.Item disabled={disabled} onClick={this.proceedToClinrecs}>
                  {t("apply")}
                </Menu.Item>
              )}
            </Menu>
            {/* <div>
              <div>clinrecs start page</div>
            </div> */}

            <div className="scrollwrapper bottomMenu">
              <Segment basic>
                {Array.isArray(clinicalGuidelinesExist) &&
                  clinicalGuidelinesExist.map((sick, i) => (
                    <div key={sick.id}>
                      <Header as="h3" className="stretched">
                        <Icon name="unordered list" />
                        <Header.Content>{sick && sick.name}</Header.Content>
                      </Header>
                      <List key={"st_ls_" + i}>
                        {sick.items?.length ? (
                          sick.items.map((item) => {
                            return this.renderTree(item);
                          })
                        ) : sick.clinicalreference && _.keys(sick.clinicalreference).length ? (
                          _.keys(sick.clinicalreference).map((id) => {
                            let item = { id, ...sick.clinicalreference[id] };
                            return this.renderClinrec(item);
                          })
                        ) : (
                          <Message>Нет доступных клинреков</Message>
                        )}
                      </List>
                    </div>
                  ))}
              </Segment>
            </div>
          </>
        );
      }
    }
  )
);

export default withTranslation()(ClinrecStartPage);
