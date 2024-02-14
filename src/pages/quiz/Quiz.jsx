import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import "./quiz.css";

export default function Quiz() {
  const [triviaItems, setTriviaItems] = useState({});
  const [formData, setFormData] = useState({}); // { questionId: userAnswer }
  const [componentId, setComponentId] = useState(nanoid());
  const numQuestions = 5;

  function checkResponseOk(res) {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res;
  }

  const randomizeArray = (arr) => arr.sort((a, b) => 0.5 - Math.random());

  useEffect(() => {
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

  useEffect(() => {
    const newFormData = {};
    Object.entries(triviaItems).forEach(
      ([id, triviaItems]) => (newFormData[id] = "")
    );
    setFormData(newFormData);
  }, [triviaItems]);

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

  function checkAnswers(event) {
    event.preventDefault();
    console.log("you checked the answers");
    Object.entries(formData).forEach(([id, ans]) =>
      console.log(`${id} ${ans}`)
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const questionId = name;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [questionId]: value,
    }));
  }

  const triviaItemElems = Object.entries(triviaItems).map(([id, item]) => {
    const optionElems = item.options.map((option, index) => {
      const identifier = `${id}_option-${index + 1}_${componentId}`;

      // The options for answers to the question
      return (
        <div key={identifier} className="radio-button">
          <input
            type="radio"
            name={id}
            value={option}
            id={identifier}
            onChange={handleChange}
          />
          <label htmlFor={identifier}>{option}</label>
        </div>
      );
    });

    return (
      <fieldset key={id} className="trivia-item">
        <legend className="trivia-item__title">{item.question}</legend>
        <div className="trivia-item__options-container">{optionElems}</div>
        <hr className="trivia-item__line"></hr>
      </fieldset>
    );
  });

  return (
    <>
      <form onSubmit={checkAnswers} className="trivia-item-container">
        {triviaItemElems}
        <button>Check answers</button>
      </form>
    </>
  );
}
