import React from "react";
import PropTypes from "prop-types";

import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";

import * as styles from "./Input.module.css";

const Input = ({
  onKeyUp,
  value,
  onChange,
  placeholder,
  onSearch,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <input
        onKeyUp={onKeyUp}
        className={styles.customInput}
        value={value}
        type="text"
        onChange={onChange}
        placeholder={placeholder}
        onFocus={(e) => (e.target.placeholder = "")}
        onBlur={(e) => (e.target.placeholder = `${placeholder}`)}
      />

      <Icon
        path={mdiMagnify}
        size={1}
        style={{ marginLeft: -40, marginRight: 20, cursor: "pointer" }}
        color="white"
        onClick={(e) => onSearch(e)}
      />
    </div>
  );
};


Input.propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onKeyUp: PropTypes.func,
  onChange: PropTypes.func.isRequired,
}

export default Input;
