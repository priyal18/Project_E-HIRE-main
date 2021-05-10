import React, { useState, useEffect } from "react";
import { v4 as uuidV4 } from "uuid";

function Create() {
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    setRoomId(uuidV4());
  }, []);

  const joinHandler = () => {
    window.location.href = `/${roomId}`;
  };

  return (
    <div>
      <p>Create</p>
      <div>
        <label>{roomId}</label>
        <div>
          <button>Share</button>
          <button onClick={joinHandler}>Join</button>
        </div>
      </div>

      <p className='back' onClick={() => (window.location.href = "/")}>
        Back
      </p>
    </div>
  );
}

export default Create;
