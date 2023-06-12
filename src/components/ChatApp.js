import React, { useState } from "react";
import useWebSocket from "react-use-websocket";
import LogoutBtn from "./LogoutBtn";
import { useEffect } from "react";
import LogoImg from "../images/logo.png";
import { Route, Routes, useParams } from "react-router-dom";
import ChannelList from "./ChannelList";
import MessageBox from "./MessageBox";
import ErrorPage from "./ErrorPage";
import SelectChannelPage from "./SelectChannelPage";

const wsurl = "ws://localhost:3002";

const emptyObject = {
  reciever_id: null,
  sender_id: null,
  sender_name: null,
  reciever_name: null,
};

const ChatApp = ({ token, setToken }) => {
  const [content, setContent] = useState("");
  const [data, setData] = useState([]);
  const [state, setState] = useState(emptyObject);
  const [channels, setChannels] = useState([]);
  const [cid, setChannelId] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [channelName, setChannelName] = useState("");

  const params = useParams();
  useEffect(() => {
    setChannelId(params["*"]);
    // eslint-disable-next-line
  }, [params["*"]]);

  const handleMessage = (event) => {
    // console.log(event);
    const _data = JSON.parse(event.data);
    console.log("Handle Message", _data);
    setData([_data, ...data]);
  };

  // useEffect(() => {
  //   fetch("http://localhost:3001/getmessages", {
  //     method: "GET",
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: "Bearer " + token.accessToken,
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setData(data));
  //   // eslint-disable-next-line
  // }, []);

  // useEffect(() => {
  //   console.log(data);
  //   // eslint-disable-next-line
  // }, [data.length]);

  const { sendMessage, readyState } = useWebSocket(wsurl, {
    onOpen: () => {
      // console.log("websocket connection established.");
    },
    onMessage: handleMessage,
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    const endpointUser = "http://localhost:3001/user";
    const endpointReceiver = "http://localhost:3001/receiver";

    const updateState = (userData, receiverData) => {
      console.log("user data: ", userData);
      console.log("receiver data: ", receiverData);
      console.log("update state", state);
      setState((prev) => {
        const newState = {
          ...prev,
          sender_id: userData[0].id,
          sender_name: userData[0].name,
          reciever_id: receiverData[0].id,
          reciever_name: receiverData[0].name,
        };
        console.log("Updated state:", newState);
        return newState;
      });
    };

    const fetchData = async () => {
      try {
        const userRes = await fetch(endpointUser, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token.accessToken,
          },
        });

        if (!userRes.ok) {
          throw new Error("User not found!");
        }

        const userData = await userRes.json();

        const receiverRes = await fetch(endpointReceiver, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token.accessToken,
          },
        });

        if (!receiverRes.ok) {
          throw new Error("Receiver not found!");
        }

        const receiverData = await receiverRes.json();

        updateState(userData, receiverData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  // useEffect(() => {
  //   console.log(state); // Logs the state whenever it changes
  // }, [state]);

  const send = async (e) => {
    e.preventDefault();
    if (content === "" || cid === null) return;
    // const endpointSend = "http://localhost:3001/send";
    const endpointSend = "http://localhost:3002/send-message";
    try {
      await fetch(endpointSend, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
        body: JSON.stringify({
          channel_id: cid,
          content: content,
          timestamp: Date.now(),
        }),
      });
      setContent("");
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // document.getElementById("myForm").submit();
      send(e);
    }
  };

  useState(() => {
    console.log(state);
  }, [state]);

  return (
    <>
      <nav>
        <div className="logo">
          <img src={LogoImg} alt="logo" />
          <h1>Chat App</h1>
        </div>
        <div className="profile">
          <p>{state.sender_name}</p>
          <LogoutBtn setToken={setToken} />
        </div>
      </nav>
      <div className="main-container">
        <div className="message-wrap">
          <div className="channel-wrap-container">
            <ChannelList
              token={token}
              setChannels={setChannels}
              setChannelId={setChannelId}
            />
          </div>
          <div className="message-container-wrap">
            <div className="reciever-profile">
              <p>
                <strong>#</strong> {channelName ? channelName : "channels"}
              </p>
            </div>
            <div className="message-container">
              <Routes>
                <Route path="/" element={<SelectChannelPage />} />
                <Route path="/*" element={<ErrorPage />} />
                {channels.map((object) => {
                  return (
                    <Route
                      key={object.channel_id}
                      path={"/" + object.channel_id}
                      element={
                        <MessageBox
                          data={data}
                          setData={setData}
                          token={token}
                          channel={object.channel_id}
                          state={state}
                          sendMessage={sendMessage}
                          readyState={readyState}
                          messageHistory={messageHistory}
                          setMessageHistory={setMessageHistory}
                          channelName={object.channel_name}
                          setChannelName={setChannelName}
                        />
                      }
                    />
                  );
                })}
              </Routes>
            </div>
            <form onSubmit={send} className="controls" id="myForm">
              <textarea
                placeholder="type in your message"
                name="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                onKeyDown={handleKeyDown}
              ></textarea>
              {/* <button>send</button> */}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatApp;
