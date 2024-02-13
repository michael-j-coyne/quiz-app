import "./intro.css";

export default function Intro() {
  return (
    <div className="intro">
      <h1 className="intro__title">Quiz yourself!</h1>
      <p className="intro__description">
        Test your knowledge of various topics!
      </p>
      <button className="intro__button">Start Quiz</button>
    </div>
  );
}
