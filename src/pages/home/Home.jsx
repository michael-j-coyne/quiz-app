import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  const params = {
    amount: 5,
    difficulty: "easy",
  };

  return (
    <div className="home">
      <div className="home__spacer"></div>
      <h1 className="home__title">Quiz yourself!</h1>
      <p className="home__description">
        Test your knowledge of various topics!
      </p>
      <Link
        className="home__button"
        to={`/quiz?amount=${params.amount}&difficulty=${params.difficulty}`}
      >
        Start Quiz
      </Link>
    </div>
  );
}
