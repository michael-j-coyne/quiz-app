import { nanoid } from "nanoid";
import "./trivia-item.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function RadioInput({ value, labelText, checked, name, handleChange }) {
  const id = nanoid();

  return (
    <>
      <input
        type="radio"
        name={name}
        value={value}
        id={id}
        onChange={handleChange}
        checked={checked}
      />
      <label htmlFor={id}>{labelText}</label>
    </>
  );
}

export default function TriviaItem(props) {
  const optionElems = props.options?.map((optionText) => {
    return (
      <RadioInput
        key={nanoid()}
        value={optionText}
        labelText={optionText}
        name={props.questionId}
        handleChange={props.handleChange}
        checked={props.checkedOption === optionText}
      />
    );
  });

  return (
    <fieldset className="question">
      {props.skeleton ? (
        <h1 className="trivia-item__title">
          <Skeleton />
        </h1>
      ) : (
        <legend className="trivia-item__title">{props.question}</legend>
      )}
      <div className="trivia-item__options-container">
        {optionElems && optionElems}
        {props.skeleton && <Skeleton width={64} />}
        {props.skeleton && <Skeleton width={64} />}
        {props.skeleton && <Skeleton width={64} />}
        {props.skeleton && <Skeleton width={64} />}
      </div>
      <hr className="trivia-item__line"></hr>
    </fieldset>
  );
}
