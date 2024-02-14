import TriviaItem from "../../components/trivia-item/TriviaItem";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import "./quiz.css";

export default function Quiz() {
  const [triviaItems, setTriviaItems] = useState([]);
  const [formData, setFormData] = useState([]); // { questionId: userAnswer }
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
      .then((obj_arr) => {
        const newFormData = {};
        obj_arr.forEach((obj) => (newFormData[obj.id] = ""));
        setFormData(newFormData);

        setTriviaItems(obj_arr);
        return obj_arr;
      })
      .catch((error) => console.log(error));
  }, []);

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
    return response.results.map((triviaItem) => ({
      id: nanoid(),
      question: decode(triviaItem.question),
      options: randomizeArray([
        ...triviaItem.incorrect_answers.map((ans) => decode(ans)),
        decode(triviaItem.correct_answer),
      ]),
      answer: triviaItem.correct_answer,
    }));
  }

  const triviaItemElems = triviaItems.map((item) => (
    <TriviaItem
      key={item.id}
      questionId={item.id}
      question={item.question}
      options={item.options}
      handleChange={handleChange}
    />
  ));

  return (
    <>
      <form className="trivia-item-list">
        {triviaItemElems.length > 0
          ? triviaItemElems
          : new Array(numQuestions)
              .fill(0)
              .map(() => <TriviaItem key={nanoid()} skeleton={true} />)}
      </form>
    </>
  );
}
