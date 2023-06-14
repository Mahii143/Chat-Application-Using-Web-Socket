import React from "react";

const ChannelOptions = ({
  token,
  chlname,
  setChlname,
  chlnamejoin,
  setChlnamejoin,
}) => {
  const createChannel = async (e) => {
    e.preventDefault();
    if (chlname === null) return;
    const endpointCreate = "http://localhost:3002/create-channel";
    try {
      await fetch(endpointCreate, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
        body: JSON.stringify({
          channel_name: chlname,
        }),
      });
      setChlname("");
    } catch (err) {
      console.log(err.message);
    }
  };
  const joinChannel = async (e) => {
    e.preventDefault();
    if (chlnamejoin === null) return;
    const endpointJoin = "http://localhost:3002/join-channel";
    try {
      await fetch(endpointJoin, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
        body: JSON.stringify({
          channel_id: chlnamejoin,
        }),
      });
      setChlnamejoin("");
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <>
      <form
        onSubmit={createChannel}
        className="create-channel-form"
        id="myForm1"
      >
        <label htmlFor="create-channel">
          Create a channel
          <br />
          <input
            id="create-channel"
            type="text"
            placeholder="channel name"
            name="chlname"
            value={chlname}
            onChange={(e) => {
              setChlname(e.target.value);
            }}
          ></input>
        </label>
        <button>Create Channel</button>
      </form>
      <form onSubmit={joinChannel} className="join-channel-form" id="myForm1">
        <label htmlFor="join-channel">
          Join a channel
          <br />
          <input
            id="join-channel"
            type="text"
            placeholder="invite code"
            name="chlnamejoin"
            value={chlnamejoin}
            onChange={(e) => {
              setChlnamejoin(e.target.value);
            }}
          ></input>
        </label>
        <button>Join Channel</button>
      </form>
    </>
  );
};

export default ChannelOptions;
