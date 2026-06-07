import { Link } from "react-router-dom";
import { FaBookOpen, FaLanguage, FaPlay, FaRegStickyNote } from "react-icons/fa";
import "./Homepage.scss";

const Home = () => {
  return (
    <main className="home-page">
      <div className="container">
        <section className="home-hero">
          <div>
            <span className="home-kicker">Language video workspace</span>
            <h1>Learn from videos, keep every word in one place.</h1>
            <p>
              Organize lessons by language, import transcripts, save notes, and
              review vocabulary with focused flashcards.
            </p>
          </div>
          <div className="home-actions">
            <Link className="btn btn-primary" to="/videos">
              <FaPlay />
              <span>Open lessons</span>
            </Link>
            <Link className="btn btn-outline-secondary" to="/vocabulary">
              <FaBookOpen />
              <span>Review words</span>
            </Link>
          </div>
        </section>

        <section className="home-grid">
          <Link className="home-card" to="/videos">
            <FaLanguage />
            <strong>Language folders</strong>
            <span>Keep videos grouped by the language you are studying.</span>
          </Link>
          <Link className="home-card" to="/notes">
            <FaRegStickyNote />
            <strong>Video notes</strong>
            <span>Jump back to exact moments from notes grouped by video.</span>
          </Link>
          <Link className="home-card" to="/vocabulary">
            <FaBookOpen />
            <strong>Vocabulary review</strong>
            <span>Study saved words with flashcards and spaced review.</span>
          </Link>
        </section>
      </div>
    </main>
  );
};

export default Home;
