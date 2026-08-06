import { FaUsers, FaHandshake, FaRocket } from "react-icons/fa";
import "./Loader.css";

function Loader({
  title = "Team Collaboration",
  message = "Bringing the team together...",
}) {
  return (
    <div className="loader-wrapper">
      <div className="loader-container">
        <div className="loader-circle"></div>

        <div className="team-wrapper">
          <FaUsers className="team-icon" />
        </div>
      </div>

      {/* Optional: Additional floating icons for more visual appeal */}
      <div className="floating-icons">
        <FaHandshake className="float-icon handshake" />
        <FaRocket className="float-icon rocket" />
      </div>

      <h2 className="loader-title">{title}</h2>

      <p className="loader-text">{message}</p>
    </div>
  );
}

export default Loader;