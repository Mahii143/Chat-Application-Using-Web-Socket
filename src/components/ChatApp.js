import React, { useState } from "react";
import useWebSocket from "react-use-websocket";
import LogoutBtn from "./LogoutBtn";
import { useEffect } from "react";

const wsurl = "ws://localhost:3001";

const emptyObject = {
  reciever_id: "",
  sender_id: "",
  sender_name: "",
  reciever_name: "",
};

const ChatApp = ({ token, setToken }) => {
  const [content, setContent] = useState("");
  const [data, setData] = useState([]);
  const [state, setState] = useState({ ...emptyObject });
  const handleMessage = (event) => {
    const _data = JSON.parse(event.data);
    console.log("Handle Message", _data);
    setData([_data, ...data]);
  };

  useEffect(() => {
    fetch("http://localhost:3001/getmessages", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token.accessToken,
      },
    })
      .then((res) => res.json())
      .then((data) => setData(data));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(data);
    // eslint-disable-next-line
  }, [data.length]);

  useWebSocket(wsurl, {
    onOpen: () => {
      console.log("websocket connection established.");
    },
    onMessage: handleMessage,
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    const endpointUser = "http://localhost:3001/user";
    const endpointReciever = "http://localhost:3001/reciever";

    const fetchUser = async () => {
      try {
        const res = await fetch(endpointUser, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token.accessToken,
          },
        });

        if (!res.ok) {
          throw new Error("User not found!");
        }

        const data = await res.json();
        setState((prevState) => ({
          ...prevState,
          sender_id: data[0].id,
          sender_name: data[0].name,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchReceiver = async () => {
      try {
        const res = await fetch(endpointReciever, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token.accessToken,
          },
        });

        if (!res.ok) {
          throw new Error("Receiver not found!");
        }

        const data = await res.json();
        setState((prevState) => ({
          ...prevState,
          reciever_id: data[0].id,
          reciever_name: data[0].name,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
    fetchReceiver();
  }, []);

  useEffect(() => {
    console.log(state); // Logs the state whenever it changes
  }, [state]);

  const send = async () => {
    const endpointSend = "http://localhost:3001/send";
    try {
      await fetch(endpointSend, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
        body: JSON.stringify({
          senderid: state.sender_id,
          receiverid: state.reciever_id,
          content: content,
          timestamp: Date.now(),
        }),
      });
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <>
      <nav>
        <div className="logo">
          <h1>ChatApp</h1>
        </div>
        <div className="profile">
          <p>{state.sender_name}</p>
          <LogoutBtn setToken={setToken} />
        </div>
      </nav>
      <div className="main-container">
        <div className="reciever-profile">{state.reciever_name}</div>
        <div className="message-container">
          {data.map((object, index) => {
            return (
              <div className="message-box" key={index}>
                <div
                  className={
                    "message " +
                    (object.sender_id === state.sender_id
                      ? "sender"
                      : "reciever")
                  }
                >
                  <p>{object.content}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="controls">
          <input
            type="text"
            name="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
          <button onClick={send}>send</button>
        </div>
      </div>
    </>
  );
};

export default ChatApp;
