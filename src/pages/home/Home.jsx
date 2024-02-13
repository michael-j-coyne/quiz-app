import "./home.css";

export default function Home() {
  return (
    <div className="home">
      <h1 className="home__title">Quiz yourself!</h1>
      <p className="home__description">
        Test your knowledge of various topics!
      </p>
      <button className="home__button">Start Quiz</button>
    </div>
  );
}
