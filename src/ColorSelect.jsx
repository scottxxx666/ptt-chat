import Select from "react-select";
import PropTypes from "prop-types";
import {themeModeColor} from "./theme.js";

ColorSelect.propTypes = {
  label: PropTypes.node,
  name: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.object,
  options: PropTypes.array,
  themeMode: PropTypes.string,
}

export default function ColorSelect({label, name, onChange, defaultValue, options, themeMode}) {
  const bgColor = themeModeColor(themeMode).background

  function optionsClass({data, isFocused}) {
    return `${data.value} ${isFocused ? themeModeColor(themeMode).optionHover : bgColor}`
  }

  return (
    <label className={'ptt-flex ptt-items-center'}>{label}：
      <Select
        key={defaultValue.value}
        name={name}
        onChange={onChange}
        defaultValue={defaultValue}
        options={options}
        classNames={{
          singleValue: ({data}) => data.value, option: optionsClass,
          control: () => bgColor, menu: () => bgColor,
          input: () => themeModeColor(themeMode).text,
        }}
      />
    </label>
  )
}