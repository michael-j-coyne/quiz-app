import { useId } from "react";
import "./radio-button.css";

export default function RadioButton({
  value,
  labelText,
  checked,
  name,
  handleChange,
}) {
  const id = useId();

  return (
    <div className="radio-button">
      <input
        type="radio"
        name={name}
        value={value}
        id={id}
        onChange={handleChange}
        checked={checked}
      />
      <label htmlFor={id}>{labelText}</label>
    </div>
  );
}
