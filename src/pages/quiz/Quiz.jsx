import TriviaItem from "../../components/trivia-item/TriviaItem";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import "./quiz.css";

export default function Quiz() {
  const [triviaItems, setTriviaItems] = useState([]);
  const numQuestions = 5;

  function checkResponseOk(res) {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res;
  }

  useEffect(() => {
    fetch(
      "https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple"
    )
      .then((res) => checkResponseOk(res))
      .then((res) => res.json())
      .then((json) => toObjects(json))
      .then((items) => setTriviaItems(items))
      .catch((error) => console.log(error));
  }, []);

  function generateOptionsObjects(optionsArr) {
    const randomizeArray = (arr) => arr.sort((a, b) => 0.5 - Math.random());
    return randomizeArray(
      optionsArr.map((optionText) => ({
        id: nanoid(),
        text: optionText,
        selected: false,
      }))
    );
  }

  function setSelectedOption(itemId, optionId) {
    const setSelected = (options) =>
      options.map((option) =>
        option.id === optionId
          ? { ...option, selected: true }
          : { ...option, selected: false }
      );

    setTriviaItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? { ...item, options: setSelected(item.options, optionId) }
          : item
      )
    );
  }

  function toObjects(response) {
    return response.results.map((triviaItem) => ({
      id: nanoid(),
      question: decode(triviaItem.question),
      options: generateOptionsObjects([
        ...triviaItem.incorrect_answers,
        triviaItem.correct_answer,
      ]),
      correctAnswer: triviaItem.correct_answer,
      selected: false,
    }));
  }

  const triviaItemElems = triviaItems?.map((item) => (
    <TriviaItem
      key={item.id}
      isLoading={false}
      question={item.question}
      options={item.options}
      selected={item.selected}
      setSelectedOption={(optionId) => setSelectedOption(item.id, optionId)}
    />
  ));

  return (
    <>
      <div className="trivia-item-list">
        {triviaItemElems.length > 0
          ? triviaItemElems
          : new Array(numQuestions).fill(<TriviaItem skeleton={true} />)}
      </div>
    </>
  );
}
