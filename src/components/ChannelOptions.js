import React, { useEffect, useState } from "react";

const ChannelOptions = ({
  token,
  chlname,
  setChlname,
  chlnamejoin,
  setChlnamejoin,
}) => {
  const [invCode, setInvCode] = useState("");
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

  useEffect(
    () => console.log("after calling code", chlnamejoin),
    [chlnamejoin]
  );
  const getChannelId = async () => {
    // e.preventDefault();

    if (invCode === null || invCode === "" || invCode.length < 6) {
      alert("Invalid invite code");
      return null;
    }

    const endpointChannelId = "http://localhost:3002/get-invited-channel";

    try {
      const response = await fetch(endpointChannelId, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
        body: JSON.stringify({
          invite_code: invCode,
        }),
      });

      try {
        const data = await response.json();
        setInvCode("");
        return data.channel_id;
      } catch (err) {
        throw new Error("No channel found");
      }
    } catch (err) {
      console.log(err.message);
      return null;
    }
  };

  const joinChannel = async (e) => {
    e.preventDefault();

    const channelId = await getChannelId(e);

    if (channelId === null) {
      alert("No channel ID");
      return;
    }

    const endpointJoin = "http://localhost:3002/join-channel";

    try {
      const resp = await fetch(endpointJoin, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
        body: JSON.stringify({
          channel_id: channelId,
        }),
      });

      if (!resp.ok) {
        alert("Error while joining");
        return;
      }
    } catch (err) {
      console.log(err);
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
            value={invCode}
            onChange={(e) => {
              setInvCode(e.target.value);
            }}
          ></input>
        </label>
        <button>Join Channel</button>
      </form>
    </>
  );
};

export default ChannelOptions;
