import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Slider from "react-slick";

import { Menu, Icon, Segment, List, Divider, Button, Form, Header, Input } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "patients")
@observer
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,

      step: null,

      isLoading: false,
      searchQuery: "",
    };
    this.sliderRef = createRef();
  }
  componentDidMount() {
    this.props.actions.getProfile();
  }
  render() {
    const {
      id,
      fio,
      firstname,
      lastname,
      patronymic,
      sex,
      snils,
      diploms,
      licenses,
      emails,
      phone,
    } = this.props.actions.profile;
    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: false,
      swipe: false,
      initialSlide: 0,
    };
    return (
      <div className="h100">
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color="red" onClick={this.back}>
            Отмена
          </Menu.Item>
          <Menu.Item onClick={this.savePatient}>Сохранить</Menu.Item>
        </Menu>

        <Slider ref={this.sliderRef} {...settings}>
          <div className="scrollwrapper bottomMenu">
            <Form>
              <Form.Group>
                <Form.Field width={10}>
                  <Header as="h2" content={fio} subheader={snils} />
                </Form.Field>
              </Form.Group>
              <Divider horizontal fitted />
              <Form.Group>
                <Form.Field>
                  <label>Пол</label>
                  <Button.Group size="big">
                    <Button primary={sex === "man"} onClick={this.handleChange} name="sex" value="man">
                      Мужчина
                    </Button>
                    <Button primary={sex === "woman"} onClick={this.handleChange} name="sex" value="woman">
                      Женщина
                    </Button>
                  </Button.Group>
                </Form.Field>
              </Form.Group>
            </Form>
          </div>
        </Slider>
      </div>
    );
  }
}
export default Profile;
