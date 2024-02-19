import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useLocation } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import "./quiz.css";

export default function Quiz() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const amount = Number(searchParams.get("amount")) || 5;
  const difficulty = searchParams.get("difficulty") || "easy";

  const [triviaItems, setTriviaItems] = useState({});
  const [componentId, setComponentId] = useState(nanoid());
  const [selectedAnswers, setSelectedAnswers] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const answersSubmitted = selectedAnswers !== undefined;

  const randomizeArray = (arr) => arr.sort((a, b) => 0.5 - Math.random());

  async function fetchTrivia(token, { maxRetries, retryDelayMs }) {
    if (!token) {
      throw new Error("Tried to fetch data without token");
    } else if (maxRetries < 0) {
      throw new Error("Could not fetch data. Max retries exceeded.");
    }

    try {
      const res = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple&token=${token}`
      );

      if (res.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        return fetchTrivia(token, {
          maxRetries: maxRetries - 1,
          retryDelayMs: retryDelayMs,
        });
      } else if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }

      const json = await res.json();

      // token not found
      if (json.response_code === 3) {
        const newToken = await fetchToken();
        setToken(newToken);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        return fetchTrivia(newToken, {
          maxRetries: maxRetries - 1,
          retryDelayMs: retryDelayMs,
        });
      }

      return toTriviaItemsObject(json);
    } catch (e) {
      throw e;
    }
  }

  async function fetchToken() {
    try {
      const res = await fetch(
        "https://opentdb.com/api_token.php?command=request"
      );

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const json = await res.json();

      const resToken = json.token;
      return resToken;
    } catch (e) {
      throw e;
    }
  }

  async function initialize() {
    const localToken = localStorage.getItem("triviaToken");
    const token = localToken ? localToken : await fetchToken();
    setToken(token);

    try {
      setIsLoading(true);
      const trivia = await fetchTrivia(token, {
        maxRetries: 6,
        retryDelayMs: 1800,
      });
      setTriviaItems(trivia);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    token && localStorage.setItem("triviaToken", token);
  }, [token]);

  useEffect(() => {
    // reset the form data
    reset();
    setSelectedAnswers();
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
      answer: decode(triviaItem.correct_answer),
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
    if (totalQuestions === 0 || !answersSubmitted) return "You got 0 correct";

    Object.entries(selectedAnswers).forEach(([itemId, answer]) => {
      const correctAnswer = triviaItems[itemId].answer;
      if (answer === correctAnswer) numCorrect++;
    });

    return `You got ${numCorrect} / ${totalQuestions} correct`;
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

  const triviaItemSkeletons = new Array(amount).fill(0).map((val, idx) => (
    <div key={idx} className="trivia-item">
      <div className="trivia-item__title">
        <Skeleton />
      </div>
      <div className="trivia-item__options-container">
        <Skeleton width={64} />
        <Skeleton width={64} />
        <Skeleton width={64} />
        <Skeleton width={64} />
      </div>
      <hr className="trivia-item__line"></hr>
    </div>
  ));

  function getNewQuestions() {
    document.activeElement.blur();
    setIsLoading(true);
    fetchTrivia(token, { maxRetries: 6, retryDelayMs: 1800 })
      .then((trivia) => {
        setTriviaItems(trivia);
        setIsLoading(false);
      })
      .catch((e) => console.error(e));
  }

  return (
    <>
      <SkeletonTheme baseColor="#D3D3D3">
        <form
          onSubmit={handleSubmit(setSelectedAnswers)}
          className="trivia-item-container"
        >
          {triviaItemElems.length > 0 && !isLoading
            ? triviaItemElems
            : triviaItemSkeletons}
          <div className="trivia-item-container__button-container">
            {answersSubmitted && !isLoading && <h3>{numQuestionsCorrect()}</h3>}
            <button
              type={answersSubmitted ? "button" : "submit"}
              onClick={answersSubmitted ? getNewQuestions : null}
              className={`trivia-item-container__button${
                isLoading ? " hidden" : ""
              }`}
            >
              {answersSubmitted ? "Play again" : "Check answers"}
            </button>
            {isLoading && <Skeleton width={120} height={50} />}
          </div>
        </form>
      </SkeletonTheme>
    </>
  );
}
