import "./radio-button.css";

export default function RadioButton({
  value,
  labelText,
  checked,
  name,
  handleChange,
  id,
  required,
}) {
  return (
    <div className="radio-button">
      <input
        type="radio"
        name={name}
        value={value}
        id={id}
        onChange={handleChange}
        required={required}
      />
      <label htmlFor={id}>{labelText}</label>
    </div>
  );
}
