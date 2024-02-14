import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import "./quiz.css";

export default function Quiz() {
  const [triviaItems, setTriviaItems] = useState({});
  const [componentId, setComponentId] = useState(nanoid());
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const numQuestions = 5;

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
    fetch(
      "https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple"
    )
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

  function checkAnswers(data) {
    console.log("you checked the answers");
    console.log(data);
  }

  const triviaItemElems = Object.entries(triviaItems).map(([itemId, item]) => {
    const optionElems = item.options.map((option, index) => {
      const identifier = `${itemId}_option-${index + 1}_${componentId}`;

      // The options for answers to the question
      return (
        <div key={identifier} className="radio-button">
          <input
            type="radio"
            name={itemId}
            value={option}
            id={identifier}
            {...register(itemId, { required: true })}
          />
          <label htmlFor={identifier}>{option}</label>
        </div>
      );
    });

    return (
      <fieldset key={itemId} className="trivia-item">
        <legend className="trivia-item__title">{item.question}</legend>
        <div className="trivia-item__options-container">{optionElems}</div>
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
        onSubmit={handleSubmit(checkAnswers)}
        className="trivia-item-container"
      >
        {triviaItemElems}
        <div>
          <button className="trivia-item-container__button">
            Check answers
          </button>
        </div>
      </form>
    </>
  );
}
