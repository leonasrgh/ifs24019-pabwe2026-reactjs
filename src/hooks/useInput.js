import { useState } from "react";

function useInput(defaultValue = "") {
  const [value, setValue] = useState(defaultValue);

  function handleValueChange(event) {
    setValue(event.target.value);
  }

  return [value, handleValueChange, setValue];
}

export default useInput;
