import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  return (
    <div className="home">
      <h1 className="home__title">Quiz yourself!</h1>
      <p className="home__description">
        Test your knowledge of various topics!
      </p>
      <Link className="home__button" to="/quiz">
        Start Quiz
      </Link>
    </div>
  );
}
