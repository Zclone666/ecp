import React, { Component } from "react";
import { inject, observer } from "mobx-react";

// import RouterLink from '../../../router/a'
import { Collapse } from "react-collapse";
import { withTranslation } from "react-i18next";
import "./InfoItems.css";

import {
  // Menu,
  List,
  // Transition,
  // Button,
  Icon,
  Segment,
  // Label,
  // Table,
  Dimmer,
  Header,
  Feed,
} from "semantic-ui-react";

import _ from "lodash";

const InfoItems = inject(
  "db",
  "actions",
  "druginfo",
  "router",
  "drugs"
)(
  observer(
    class InfoItems extends Component {
      constructor(props) {
        super(props);

        this.state = {
          opened: null,
        };
      }

      collapse = (opened) => {
        if (this.state.opened === opened) {
          this.setState({ opened: null });
        } else {
          this.setState({ opened });
        }
      };

      renderHtml = (item) => {
        return <Segment basic dangerouslySetInnerHTML={{ __html: item.text }}></Segment>;
      };
      renderList = (item) => {
        return (
          <Segment basic>
            <Feed>
              {item.items &&
                _.map(item.items, (listitem, i) => {
                  return (
                    <Feed.Event key={"infoItem" + i}>
                      <Feed.Content>
                        {listitem.bold ? (
                          <Feed.Summary style={{ fontWeight: 700 }}>{listitem.text}</Feed.Summary>
                        ) : (
                          <Feed.Summary style={{ fontWeight: 700 }} id="wrapImportant">
                            {listitem.code} <span style={{ fontWeight: "normal" }}>{listitem.text}</span>
                          </Feed.Summary>
                        )}
                      </Feed.Content>
                    </Feed.Event>
                  );
                })}
            </Feed>
          </Segment>
        );
      };
      renderText = (item) => {
        return <Segment basic>{item.text}</Segment>;
      };

      renderTree(items, parent) {
        let iteratable = _.keys(items);
        return iteratable.map((id) => {
          let item = items[id];
          if ((!item.parent_ids && !parent) || (item.parent_ids && item.parent_ids.includes(parent))) {
            return (
              <List.Item key={id}>
                {item.bold ? (
                  <List.Icon name="chevron circle right" size="small" />
                ) : (
                  <List.Icon name="circle" size="small" />
                )}
                <List.Content>
                  <List.Description>
                    <strong>{item.code}</strong> {item.bold ? <strong>{item.text}</strong> : item.text}
                  </List.Description>
                  {item.child_ids && item.child_ids.length > 0 && <List.List>{this.renderTree(items, id)}</List.List>}
                </List.Content>
              </List.Item>
            );
          } else {
            return null;
          }
        });
      }
      get items() {
        let {
          druginfo: { info },
          drugs: { drug },
          router,
        } = this.props;
        let drugKey = router.values && router.values.page;
        let infoObj = info.get(drugKey) || {};
        return {
          calc: (infoObj.itemsCalc && _.orderBy(infoObj.itemsCalc, ["sort"], ["asc"])) || [],
          instr: (infoObj.itemsInstr && _.orderBy(infoObj.itemsInstr, ["sort"], ["asc"])) || [],
          drug: drug.get(drugKey) || {},
        };
      }
      render() {
        let {
          druginfo: { ready },
          // router
        } = this.props;

        const { t } = this.props.actions;
        let { opened } = this.state;
        // let drugKey = router.values && router.values.page
        let { calc, instr, drug } = this.items;
        // console.log({ calc, instr });
        return (
          <>
            <Segment basic>
              <Header as="h3" className="stretched">
                <Icon name="unordered list" />
                <Header.Content>{(drug && drug.name) || t("free_information")}</Header.Content>
              </Header>
              {ready && calc.length > 0 && (
                <List divided relaxed className="draginfo" verticalAlign="middle" size="large">
                  {calc.map((item, i) => {
                    // console.log({item});
                    return (
                      <List.Item
                        key={"calc" + i}
                        style={{ cursor: "pointer" }}
                        onClick={() => this.collapse("calc" + i)}
                      >
                        <List.Content className="large">
                          <List.Header>{item.title}</List.Header>
                          <Collapse isOpened={true} initialStyle={{ height: 0, overflow: "hidden" }}>
                            {"calc" + i === opened && (
                              <List.List>
                                {
                                  {
                                    string: this.renderText(item),
                                    list: this.renderList(item),
                                    tree: this.renderTree(item.items, null),
                                    html: this.renderHtml(item),
                                  }[item.type]
                                }
                              </List.List>
                            )}
                          </Collapse>
                        </List.Content>
                      </List.Item>
                    );
                  })}
                </List>
              )}
              <Header as="h3" className="stretched">
                <Icon name="book" />
                <Header.Content>{t("instruction")}</Header.Content>
              </Header>
              {ready && instr.length > 0 && (
                <List divided relaxed className="draginfo" verticalAlign="middle" size="large">
                  {instr.map((item, i) => {
                    // console.log({item});
                    return (
                      <List.Item
                        key={"info" + i}
                        style={{ cursor: "pointer" }}
                        onClick={() => this.collapse("instr" + i)}
                      >
                        <List.Content className="large">
                          <List.Header>{item.title}</List.Header>
                          <Collapse isOpened={true} initialStyle={{ height: 0, overflow: "hidden" }}>
                            {"instr" + i === opened && (
                              <List.List>
                                {
                                  {
                                    string: this.renderText(item),
                                    list: this.renderList(item),
                                    tree: this.renderTree(item.items, null),
                                    html: this.renderHtml(item),
                                  }[item.type]
                                }
                              </List.List>
                            )}
                          </Collapse>
                        </List.Content>
                      </List.Item>
                    );
                  })}
                </List>
              )}
            </Segment>
            {ready && this.items.instr.length < 1 && this.items.calc.length < 1 && (
              <Dimmer.Dimmable as={Segment} basic dimmed={true} className="h100">
                <Dimmer active={true} inverted>
                  <Header as="h2" icon color="grey">
                    <Icon name="dont" />
                    {t("no_information")}
                  </Header>
                </Dimmer>
              </Dimmer.Dimmable>
            )}
          </>
        );
      }
    }
  )
);

export default withTranslation()(InfoItems);
