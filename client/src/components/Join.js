import React, { useState } from "react";

function Join() {
  const [id, setId] = useState("");

  const joinHandler = () => {
    window.location.href = `/${id}`;
  };

  return (
    <div>
      <p>Join</p>
      <div>
        <label htmlFor='room_id'>Enter room id: </label>
        <input
          type='text'
          className='room_id'
          onChange={(e) => setId(e.target.value)}
        ></input>
        <button type='submit' onClick={joinHandler}>
          Join
        </button>
      </div>
      <p className='back' onClick={() => (window.location.href = "/")}>
        Back
      </p>
    </div>
  );
}

export default Join;
