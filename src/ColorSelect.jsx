import Select from "react-select";
import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import PropTypes from "prop-types";

ColorSelect.propTypes = {
  label: PropTypes.node,
  name: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.object,
  options: PropTypes.array,
  bgColor: PropTypes.string,
}

export default function ColorSelect({label, name, onChange, defaultValue, options, bgColor}) {
  const theme = useContext(ThemeContext)

  function optionsClass({data, isFocused}) {
    return `${data.value} ${isFocused ? 'ptt-bg-red-400' : bgColor}`
  }

  return (
    <label className={'ptt-flex ptt-items-center'}>{label}：
      <Select
        name={name}
        onChange={onChange}
        defaultValue={defaultValue}
        options={options}
        classNames={{
          singleValue: ({data}) => data.value, option: optionsClass,
          control: () => bgColor, menu: () => bgColor
        }}
      />
    </label>
  )
}