import Select from "react-select";
import {bgColor} from "./theme.js";
import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import PropTypes from "prop-types";

ColorSelect.propTypes = {
  label: PropTypes.node,
  onChange: PropTypes.func,
  defaultValue: PropTypes.object,
  options: PropTypes.array,
}

export default function ColorSelect({label, onChange, defaultValue, options}) {
  const theme = useContext(ThemeContext)

  function optionsClass({data, isFocused}) {
    return `${data.value} ${isFocused ? 'ptt-bg-red-400' : bgColor(theme)}`
  }

  return (
    <label className={'ptt-flex ptt-items-center'}>{label}：
      <Select
        name="accountColor"
        onChange={onChange}
        defaultValue={defaultValue}
        options={options}
        classNames={{
          singleValue: ({data}) => data.value, option: optionsClass,
          control: () => 'ptt-bg-transparent', menu: () => bgColor(theme)
        }}
      />
    </label>
  )
}