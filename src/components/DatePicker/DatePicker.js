import React from "react";

import DatePicker, { registerLocale } from "react-datepicker";
import MaskedInput from "react-text-mask";
import ru from "date-fns/locale/ru";

registerLocale("ru", ru);

export function MyDatePicker(props) {
  const { selected, onChange, minDate, locale } = props;

  return <DatePicker
    className="react-datepicker-input"
    wrapperClassName="react-datepicker-component ui fluid big input"
    selected={selected}
    onChange={onChange}
    minDate={minDate || ""}
    dateFormat="dd.MM.yyyy"
    locale={locale || null}
    placeholderText="__.__.____"
    customInput={
      <MaskedInput
        mask={[/\d/, /\d/, ".", /\d/, /\d/, ".", /\d/, /\d/, /\d/, /\d/]}
        placeholder="__.__.____"
      />
    }
  />;
}