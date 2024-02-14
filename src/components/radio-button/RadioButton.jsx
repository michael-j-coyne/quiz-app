import "./radio-button.css";

export default function RadioButton({
  value,
  labelText,
  checked,
  name,
  handleChange,
  id,
}) {
  return (
    <div className="radio-button">
      <input
        type="radio"
        name={name}
        value={value}
        id={id}
        onChange={handleChange}
      />
      <label htmlFor={id}>{labelText}</label>
    </div>
  );
}
