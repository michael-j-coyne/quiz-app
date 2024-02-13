import { useState, useEffect } from "react";
import "./App.css";
import Intro from "./components/intro/Intro";
import TriviaItem from "./components/trivia-item/TriviaItem";
import { nanoid } from "nanoid";
import { decode } from "html-entities";

function App() {
  const [triviaItems, setTriviaItems] = useState([]);

  useEffect(() => {
    fetch(
      "https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple"
    )
      .then((res) => res.json())
      .then((json) => transformResponse(json))
      .then((items) => setTriviaItems(items));
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

  function transformResponse(response) {
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

  const triviaItemElems = triviaItems.map((item) => (
    <TriviaItem
      key={item.id}
      question={item.question}
      options={item.options}
      selected={item.selected}
      setSelectedOption={(optionId) => setSelectedOption(item.id, optionId)}
    />
  ));

  return (
    <>
      {/* <Intro /> */}
      {triviaItemElems}
    </>
  );
}

export default App;
