import { nanoid } from "nanoid";
import "./trivia-item.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import RadioButton from "../radio-button/RadioButton";

export default function TriviaItem(props) {
  const optionElems = props.options?.map((optionText, index) => {
    return (
      <RadioButton
        id={`${props.questionId}_${index}`}
        key={`${props.questionId}_${index}`}
        value={optionText}
        labelText={optionText}
        name={props.questionId}
        handleChange={props.handleChange}
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
