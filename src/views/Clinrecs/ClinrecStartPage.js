import React from "react";
import { inject, observer } from "mobx-react";
import { List, Menu, Segment, Checkbox, Popup } from "semantic-ui-react";
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

      componentDidUpdate(prevProps, prevState) {
        const { clinicalGuidelinesExist } = this.props.clinrecs;

        let checkedNew = {};
        if (Array.isArray(clinicalGuidelinesExist) && !this.state.start) {
          this.setState({ start: true });
          clinicalGuidelinesExist.forEach((item) => {
            if (item.exist) {
              checkedNew = {
                ...checkedNew,
                [item.id]: {
                  id: item.id,
                  name: item.name,
                },
              };
            }
          });
          this.setState({
            checked: checkedNew,
          });
        }
      }

      proceedToClinrecs = () => {
        const { clinrecCheckerStep } = this.props.actions;
        this.props.clinrecs.diseaseSelect = [];

        if (this.props.patients.current) {
          for (const [, value] of Object.entries(this.state.checked)) {
            if (value && !this.props.clinrecs.diseaseSelect.find((d) => d.id === value.id)) {
              this.props.clinrecs.diseaseSelect.push(value);
            }
          }
        }

        this.props.clinrecs.check(false);
        this.props.router.push(`/clinrec/checker/${clinrecCheckerStep}`);
      };

      render() {
        const { t } = this.props.actions;
        // console.log("state: ", this.state);
        const { clinicalGuidelinesExist } = this.props.clinrecs;
        // console.log({ clinicalGuidelinesExist });
        // console.log(this.state.checked);
        const disabled = !_.findKey(this.state.checked, function (o) {
          return o;
        });

        const rednerTree = (data) => {
          return data?.items?.length ? (
            <List.Item style={{ height: "100%" }} key={data.id}>
              <List.Content className="large">
                <List.Header>{data.name}</List.Header>
                <List.List style={{ paddingLeft: "5px" }}>{data.items.map((node) => rednerTree(node))}</List.List>
              </List.Content>
            </List.Item>
          ) : (
            // <List>
            data.exist && (
              <List.Item style={{ height: "100%" }} key={data.id}>
                <List.Content className="large">
                  <List.Description>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      {data.exist && (
                        <Checkbox
                          onChange={() => {
                            // data.checked = !data.checked;
                            if (this.state.checked[data.id])
                              this.setState({ checked: { ...this.state.checked, [data.id]: null } });
                            else
                              this.setState({
                                checked: {
                                  ...this.state.checked,
                                  [data.id]: {
                                    id: data.id,
                                    name: data.name,
                                  },
                                },
                              });
                          }}
                          // readonly={diseases.includes(data.id)}
                          // defaultChecked
                          // disabled={diseases.includes(data.id)}|| diseases.includes(data.id)
                          checked={!!this.state.checked[data.id]}
                          style={{ marginRight: "5px", fontSize: 16 }}
                          label={data.name}
                        />
                      )}
                    </div>
                  </List.Description>
                </List.Content>
              </List.Item>
            )
            // </List>
          );
        };

        return (
          <>
            <Menu className="bottom fixed menu two item huge main">
              <Menu.Item onClick={() => this.props.router.push("/")}>{t("back")}</Menu.Item>
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
                  clinicalGuidelinesExist.map((item, i) => (
                    <List key={"st_ls_" + i} size={"massive"}>
                      {rednerTree(item)}
                    </List>
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
