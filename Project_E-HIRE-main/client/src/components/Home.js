import React from "react";
import "../css/Home.css";

function Home() {
  const joinSession = () => {
    window.location.href = "/join";
  };
  const createSession = () => {
    window.location.href = "/create";
  };

  return (
    <div>
      <p className='join' onClick={joinSession}>
        Join a session
      </p>
      <p className='create' onClick={createSession}>
        Create new session
      </p>
    </div>
  );
}

export default Home;
