import TriviaItem from "../../components/trivia-item/TriviaItem";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import "./quiz.css";

export default function Quiz() {
  const [triviaItems, setTriviaItems] = useState({});
  const [formData, setFormData] = useState({}); // { questionId: userAnswer }
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
      .then((json) => toObjects(json))
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

  function handleChange(event) {
    const { name, value } = event.target;
    const questionId = name;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [questionId]: value,
    }));
  }

  function toObjects(response) {
    // What if there is no response.results?
    const obj = {};
    response.results.forEach(
      (triviaItem) =>
        (obj[nanoid()] = {
          question: decode(triviaItem.question),
          options: randomizeArray([
            ...triviaItem.incorrect_answers.map((ans) => decode(ans)),
            decode(triviaItem.correct_answer),
          ]),
          answer: triviaItem.correct_answer,
        })
    );
    return obj;
  }

  function checkAnswers(event) {
    event.preventDefault();
    console.log("you checked the answers");
    Object.entries(formData).forEach(([id, ans]) =>
      console.log(`${id} ${ans}`)
    );
  }

  const triviaItemElems = Object.entries(triviaItems).map(([id, item]) => (
    <TriviaItem
      key={id}
      questionId={id}
      question={item.question}
      options={item.options}
      handleChange={handleChange}
    />
  ));

  return (
    <>
      <form onSubmit={checkAnswers} className="trivia-item-list">
        {triviaItemElems.length > 0
          ? triviaItemElems
          : new Array(numQuestions)
              .fill(0)
              .map(() => <TriviaItem key={nanoid()} skeleton={true} />)}
        <button>Check answers</button>
      </form>
    </>
  );
}
