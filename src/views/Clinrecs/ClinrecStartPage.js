import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { List, Menu, Responsive, Segment, Checkbox } from "semantic-ui-react";
import { withTranslation } from "react-i18next";

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
        };
      }
      proceedToClinrecs = () => {
        // console.log("patient: ", this.props.patients.current);
        const { clinrecCheckerStep } = this.props.actions;
        if (this.props.patients.current) {
          for (const [key, value] of Object.entries(this.state.checked)) {
            if (!this.props.patients.current.disease.find((d) => d.id == value.id))
              this.props.patients.current.disease.push(value);
          }
        }
        this.props.clinrecs.check();
        this.props.router.push(`/clinrec/checker/${clinrecCheckerStep}`);
      };
      render() {
        const { t } = this.props;
        // console.log("state: ", this.state);
        const { clinicalGuidelinesExist } = this.props.clinrecs;
        const diseases = this.props.patients.current.disease
          .map((d) => d.id)
          .concat(this.props.patients.current.co_disease.map((d) => d.id));
        // console.log({ clinicalGuidelinesExist });
        const rednerTree = (data) => {
          // console.log({ data });
          return data?.items?.length ? (
            <List.Item style={{ height: "100%" }} key={data.id}>
              <List.Content className="large">
                <List.Header>{data.name}</List.Header>
                <List.List style={{ paddingLeft: "5px" }}>{data.items.map((node) => rednerTree(node))}</List.List>
              </List.Content>
            </List.Item>
          ) : (
            // <List>
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
                        readonly={diseases.includes(data.id)}
                        disabled={diseases.includes(data.id)}
                        checked={this.state.checked[data.id] || diseases.includes(data.id)}
                        style={{ marginRight: "5px", fontSize: 16 }}
                        label={data.name}
                      />
                    )}
                  </div>
                </List.Description>
              </List.Content>
            </List.Item>
            // </List>
          );
        };
        const sampleData = {
          alert: { code: "200", level: "success", sticky: false },
          result: [
            { id: "tDZ/lbIl+J157GZPZTaOVg==", name: "геморрой", exist: true, items: [] },
            {
              id: "5NPEFYebJgtVHkehexj0Zg==",
              name: "рак молочной железы",
              exist: false,
              items: [
                {
                  id: "PRMJNmMVi/itNBxcxsrHEA==",
                  name: "рак молочной железы, нелюминальный, Her2-позитивный подтип",
                  exist: true,
                  items: [],
                },
                {
                  id: "eTzyRIrUlRWaRnJcW3hL2Q==",
                  name: "рак молочной железы, тройной негативный подтип",
                  exist: true,
                  items: [],
                },
                {
                  id: "bqMNSYx7aQB9Hgz4ojzfOQ==",
                  name: "рак молочной железы люминальный B подтип",
                  exist: true,
                  items: [],
                },
                {
                  id: "TA1WbJpm4A1iv7dEWfusRg==",
                  name: "рак молочной железы люминальный А подтип",
                  exist: true,
                  items: [],
                },
              ],
              route: "down",
            },
            {
              id: "x9iOERvHhEvz6n5XoXwrCw==",
              name: "коронавирусная инфекция COVID-19",
              exist: false,
              items: [
                { id: "MuDqACqRNOyqAplclOi/+A==", name: "COVID-19 лёгкой степени тяжести", exist: true, items: [] },
                { id: "NdsfYEdQNcaxHYWH9sdqwA==", name: "COVID-19 средней степени тяжести", exist: true, items: [] },
                { id: "yTuSKeawAW+Wc3tVhF+B2w==", name: "COVID-19 тяжёлой степени тяжести", exist: true, items: [] },
              ],
              route: "down",
            },
          ],
        };
        return (
          <>
            <Menu className="bottom fixed menu two item huge main">
              <Menu.Item onClick={() => this.props.router.push("/")}>{t("back")}</Menu.Item>
              <Menu.Item onClick={this.proceedToClinrecs}>{t("apply")}</Menu.Item>
            </Menu>
            {/* <div>
              <div>clinrecs start page</div>
            </div> */}

            <div className="scrollwrapper bottomMenu">
              <Segment basic>
                {clinicalGuidelinesExist &&
                  clinicalGuidelinesExist.map &&
                  clinicalGuidelinesExist.map((item) => <List size={"massive"}>{rednerTree(item)}</List>)}
              </Segment>
            </div>
          </>
        );
      }
    }
  )
);

export default withTranslation()(ClinrecStartPage);
