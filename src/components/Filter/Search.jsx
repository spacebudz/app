import React from "react";
import PropTypes from "prop-types";

import Input from "../Input";

const Search = ({param, onKeyUp, onSearch, onChange}) => {
  const [searchId, setSearchId] = React.useState(param);
  React.useEffect(() => {
    if (param) setSearchId(param);
  }, [param]);
  return (
    <Input
      placeholder="Search #"
      value={searchId}
      onKeyUp={(e) => onKeyUp(e)}
      onSearch={() => onSearch(searchId)}
      onChange={(e) => {
        const re = /^[0-9\b]+$/;
        if (!re.test(e.target.value) && e.target.value != "") return;
        setSearchId(e.target.value);
        onChange(e);
      }}
    />
  );
};

Search.propTypes = {
  param: PropTypes.string.isRequired,
  onKeyUp: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default Search;
