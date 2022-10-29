import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";
import { List, Icon } from "semantic-ui-react";

import _ from "lodash";

const DozeTypes = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "dosages"
)(
  observer(
    class DozeTypes extends Component {
      constructor(props) {
        super(props);
        this.state = {
          current: null,
          arr: [],
          counter: 0,
          moreflag: false,
          c: 0,
          cc: 0,
        };
      }
      setDosage = (data) => {
        // console.log(data);
        let { obj, value, ...helpers } = data;
        // console.log("set dosage data: ", { data });
        let { dosages, pack } = obj;
        // console.log({ dosages, pack, value, helpers });
        this.props.actions.stepsData.dosage = dosages;
        this.props.actions.stepsData.pack = pack;
        this.props.actions.stepsData.value = value;
        this.props.actions.stepsData.helpers = helpers;
        // console.log(this.props.actions.stepsData);
      };
      loadMore = () => {
        let { counter, arr } = this.state;
        counter++;
        this.setState({ counter }, () => {
          arr = [...arr, ...this.currDosagesArr()];
          this.setState({ arr });
        });
      };
      componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.current === this.props.actions.stepsData.form) return;
        // console.log("HERE");
        this.setState({ current: this.props.actions.stepsData.form }, () => {
          let arr = this.currDosagesArr();
          this.setState({ arr });
        });
      }

      currDosagesArr() {
        let {
          actions: { stepsData },
          drugs: { current },
          actions: { t },
        } = this.props;
        let { counter, c, cc } = this.state;
        let { from, to } = { from: counter * 50, to: (counter + 1) * 50 };
        let moreflag = false;
        // let { dosage } = this;
        if (!current.id) return [];
        let drugDosage = this.props.dosages.dosage.get(current.id);
        // dosage.forEach((item, i) => {
        //   console.log({ item, i });
        // });

        // console.log({ current, drugDosage });
        if (!drugDosage) return [];
        let { form, names, nameshort } = drugDosage;

        // let c = 0;
        // let cc = 0;
        // console.log({ c, cc });
        let arr = [];
        let noData = false;
        form[stepsData.form] &&
          form[stepsData.form].dosage.forEach((item, i) => {
            if (c + cc >= from && c + cc < to) {
              // console.log("dosage");
              let itemDosage = null;
              if (_.isArray(item.dosage) && item.dosage.length > 0) itemDosage = item.dosage;
              if (_.isObject(item.dosage) && !_.isArray(item.dosage)) itemDosage = [item.dosage];
              if (!itemDosage) {
                if (
                  _.findIndex(arr, (itm) => itm.dosage && itm.dosage.small === this.props.actions.t("no_data")) === -1
                ) {
                  noData = true;
                  arr.push({
                    dosage: {
                      small: this.props.actions.t("no_data"),
                      full: this.props.actions.t("dosage_not_specified"),
                      id: 248,
                    },
                    pack: {
                      small: "",
                      full: "",
                      id: item.pack && item.pack[0] && item.pack[0].dosage ? item.pack[0].dosage.id_1 : null,
                    },
                    type: "simple",
                    value: [0],
                    obj: {
                      dosages: null,
                      pack: null,
                    },
                  });
                }
              } else {
                let currPack = {
                  dosage: { small: "", full: "", id: itemDosage[0].id_1 },
                  pack: { small: "", full: "", id: item?.pack[0]?.dosage ? item.pack[0].dosage.id_1 : null },
                  type: "simple",
                  value: [0],
                  flag: false,
                };
                if (form[stepsData.form].solute && _.isArray(item.pack) && item.pack.length > 0) {
                  item.pack.forEach((pack, x) => {
                    if (c + cc >= from && c + cc < to) {
                      // console.log("pack");
                      if (!pack.dosage) pack.dosage = {};
                      currPack = {
                        dosage: { small: "", full: "", id: itemDosage[0].id_1 },
                        pack: { small: "", full: "", id: pack.dosage.id_1 },
                        type: "simple",
                        value: [0],
                        flag: !!(itemDosage[0] && itemDosage[0].id_2),
                        obj: {
                          dosages: itemDosage,
                          pack: pack,
                        },
                      };
                      if (_.isArray(itemDosage) && itemDosage.length > 1) {
                        currPack.dosage.full +=
                          _.map(itemDosage, "value_1").join(" + ") + " " + names[itemDosage[0].id_1];
                        currPack.dosage.small +=
                          _.map(itemDosage, "value_1").join(" + ") +
                          " " +
                          (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
                        currPack.type = "multi";
                        currPack.value = Array.from(_.map(itemDosage, "value_1"));
                      } else if (_.isArray(itemDosage) && itemDosage.length === 1) {
                        let val = itemDosage[0].value_2
                          ? itemDosage[0].value_1 / itemDosage[0].value_2
                          : itemDosage[0].value_1;
                        currPack.dosage.full += val + " " + names[itemDosage[0].id_1];
                        currPack.dosage.small +=
                          val + " " + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
                        currPack.value = [val];
                      }
                      currPack.pack.full +=
                        (names[pack.id] || "") +
                        ((pack.dosage &&
                          ", " +
                          (pack.dosage.value_1 || "") +
                          " " +
                          (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1] || "")) ||
                          "");
                      currPack.pack.small +=
                        (nameshort[pack.id] || names[pack.id] || "") +
                        ((pack.dosage &&
                          ", " +
                          (pack.dosage.value_1 || "") +
                          " " +
                          (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1] || "")) ||
                          "");

                      arr.push({ ...currPack });
                      cc++;
                    }
                  });
                } else {
                  if (_.isArray(itemDosage) && itemDosage.length > 1) {
                    currPack.dosage.full += _.map(itemDosage, "value_1").join(" + ") + " " + names[itemDosage[0].id_1];
                    currPack.dosage.small +=
                      _.map(itemDosage, "value_1").join(" + ") +
                      " " +
                      (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
                    currPack.type = "multi";
                    currPack.value = Array.from(_.map(itemDosage, "value_1"));
                  } else if (_.isArray(itemDosage) && itemDosage.length === 1) {
                    let val = itemDosage[0].value_2
                      ? itemDosage[0].value_1 / itemDosage[0].value_2
                      : itemDosage[0].value_1;
                    currPack.dosage.full += val + " " + names[itemDosage[0].id_1];
                    currPack.dosage.small += val + " " + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
                    currPack.value = [val];
                  }
                  currPack.flag = !!(itemDosage[0] && itemDosage[0].id_2);
                  currPack.obj = {
                    dosages: itemDosage,
                    pack: null, //item.pack[0]
                  };
                  arr.push({ ...currPack });
                }
              }
              c++;
            } else if (c + cc > to && !moreflag) {
              moreflag = true;
            }
          });
        if (noData && arr.length > 1) {
          _.remove(arr, function (itm) {
            return itm.dosage && itm.dosage.small === t("no_data");
          });
        }
        // console.log({ c, cc });
        this.setState({ moreflag, c, cc });
        return arr;
      }

      render() {
        let {
          router: { values },
        } = this.props;
        let { moreflag } = this.state;
        let currDosagesArr = this.state.arr;
        let way = values.way || "lf";
        let url = !values.liquid ? `/concept/dozes/${way}` : `/liquid/calc/${values.liquid}/dozes/${way}`;
        let currStep = parseInt(values.step || 0);


        return (
          <List animated divided selection className="dozelist" verticalAlign="middle" size="large">
            {currDosagesArr.map((dose, i) => {
              let dosePack = "";
              if (dose.pack.full.length > 0) {
                dosePack = dose.pack.full;
                // strange logic here
                // const prev = dose.pack.full;
                // const pos = prev.lastIndexOf(",");
                // dosePack = prev.substring(0, pos);
              }
              return (
                <List.Item
                  as={RouterLink}
                  to={`${url}/${currStep + 1}`}
                  onClick={() => this.setDosage(dose)}
                  key={"type" + i}
                >
                  <List.Content floated="right">
                    <Icon name="right chevron" size="big" />
                  </List.Content>

                  <List.Content className="large">
                    {dose.flag && <Icon name="warning sign" color="red" style={{ float: "left" }} />}
                    <List.Header>{dose.dosage.small.length > 0 ? dose.dosage.small : dose.dosage.full}</List.Header>
                    {dosePack.length > 0 && <List.Description>{dosePack}</List.Description>}
                  </List.Content>
                </List.Item>
              );
            })}
            {moreflag && (
              <List.Item onClick={() => this.loadMore()}>
                <List.Content floated="right">
                  <Icon name="plus" size="big" />
                </List.Content>

                <List.Content className="large">
                  <List.Header>Показать еще</List.Header>
                </List.Content>
              </List.Item>
            )}
          </List>
        );
      }
    }
  )
);

export default DozeTypes;
