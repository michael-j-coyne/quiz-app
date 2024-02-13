import { nanoid } from "nanoid";
import "./trivia-item.css";

export default function TriviaItem(props) {
  const optionElems = props.options.map((option) => (
    <button
      className={`trivia-item__option${
        option.selected ? " trivia-item__option_selected" : ""
      }`}
      key={nanoid()}
      onClick={() => props.setSelectedOption(option.id)}
    >
      {option.text}
    </button>
  ));

  return (
    <div className="question">
      <h1 className="trivia-item__title">{props.question}</h1>
      <div className="trivia-item__options-container">{optionElems}</div>
      <hr className="trivia-item__line"></hr>
    </div>
  );
}
