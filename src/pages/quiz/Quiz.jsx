import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import "./quiz.css";

export default function Quiz() {
  const [triviaItems, setTriviaItems] = useState({});
  const [componentId, setComponentId] = useState(nanoid());
  const [selectedAnswers, setSelectedAnswers] = useState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const numQuestions = 5;

  const answersSubmitted = selectedAnswers !== undefined;

  function checkResponseOk(res) {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res;
  }

  const randomizeArray = (arr) => arr.sort((a, b) => 0.5 - Math.random());

  useEffect(() => {
    // reset the form data
    reset();
    fetch("https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple")
      .then((res) => checkResponseOk(res))
      .then((res) => res.json())
      .then((json) => toTriviaItemsObject(json))
      .then((triviaItemsObj) => {
        setTriviaItems(triviaItemsObj);
        return triviaItemsObj;
      })
      .catch((error) => console.log(error));
  }, []);

  function toTriviaItemsObject(response) {
    // What if there is no response.results?

    const triviaItemsObject = {};

    const triviaItemObject = (triviaItem) => ({
      question: decode(triviaItem.question),
      options: randomizeArray([
        ...triviaItem.incorrect_answers.map((ans) => decode(ans)),
        decode(triviaItem.correct_answer),
      ]),
      answer: triviaItem.correct_answer,
    });

    response.results.forEach(
      (triviaItem, index) =>
        (triviaItemsObject[`question-${index + 1}`] =
          triviaItemObject(triviaItem))
    );

    return triviaItemsObject;
  }

  function numQuestionsCorrect() {
    let numCorrect = 0;
    const totalQuestions = Object.keys(triviaItems).length;
    if (totalQuestions === 0 || !answersSubmitted)
      return "You scored 0 correct answers";

    Object.entries(selectedAnswers).forEach(([itemId, answer]) => {
      const correctAnswer = triviaItems[itemId].answer;
      if (answer === correctAnswer) numCorrect++;
    });

    return `You scored ${numCorrect} / ${totalQuestions} correct answers`;
  }

  function generateOptions(options, itemId) {
    function generateBtnClass(option) {
      let btnClass = "radio-button";
      // answers haven't been submitted
      if (!answersSubmitted) return btnClass;

      const isSelected = option === selectedAnswers[itemId];
      const isCorrect = option === triviaItems[itemId].answer;

      return (
        btnClass +
        (isCorrect ? " radio-button_correct-ans" : "") +
        (isSelected ? " radio-button_selected" : " radio-button_faded") +
        (isSelected && !isCorrect ? " radio-button_incorrect-ans" : "")
      );
    }

    const uniqueId = (idx) => `${itemId}_option-${idx + 1}_${componentId}`;

    return options.map((option, index) => (
      <div key={uniqueId(index)} className={generateBtnClass(option)}>
        <input
          type="radio"
          name={itemId}
          value={option}
          id={uniqueId(index)}
          disabled={answersSubmitted}
          {...register(itemId, { required: true })}
          onKeyDown={(e) => {
            e.key === "Enter" && e.preventDefault();
          }}
        />
        <label htmlFor={uniqueId(index)}>{option}</label>
      </div>
    ));
  }

  const triviaItemElems = Object.entries(triviaItems).map(([itemId, item]) => {
    return (
      <fieldset key={itemId} className="trivia-item">
        <legend className="trivia-item__title">{item.question}</legend>
        <div className="trivia-item__options-container">
          {generateOptions(item.options, itemId)}
        </div>
        <ErrorMessage
          errors={errors}
          name={itemId}
          render={() => (
            <span className="trivia-item__error-message">
              You must select an answer.
            </span>
          )}
        />
        <hr className="trivia-item__line"></hr>
      </fieldset>
    );
  });

  return (
    <>
      <form
        onSubmit={handleSubmit(setSelectedAnswers)}
        className="trivia-item-container"
      >
        {triviaItemElems}
        <div className="trivia-item-container__button-container">
          {/* Add skeleton */}
          {answersSubmitted && <h3>{numQuestionsCorrect()}</h3>}
          <button
            type={answersSubmitted ? "button" : "submit"}
            onClick={answersSubmitted ? () => console.log("hi") : null}
            className="trivia-item-container__button"
          >
            {answersSubmitted ? "Play again" : "Check answers"}
          </button>
        </div>
      </form>
    </>
  );
}
