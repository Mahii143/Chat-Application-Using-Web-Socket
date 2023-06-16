import React, { useState, useEffect } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import LogoImg from "../images/logo.png";
import LogoutBtn from "./LogoutBtn";
import ChannelList from "./ChannelList";
import MessageBox from "./MessageBox";
import SelectChannelPage from "./SelectChannelPage";
import ChannelOptions from "./ChannelOptions";
import url from "../endpoint.json";
// import ErrorPage from "./ErrorPage";


const wsurl = url.wsurl;

const emptyObject = {
  sender_id: null,
  sender_name: null,
  // reciever_id: null,
  // reciever_name: null,
};

const ChatApp = ({ token, setToken }) => {
  const [content, setContent] = useState("");
  const [data, setData] = useState([]);
  const [state, setState] = useState(emptyObject);
  const [channels, setChannels] = useState([]);
  const [cid, setChannelId] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [chlname, setChlname] = useState("");
  const [chlnamejoin, setChlnamejoin] = useState("");
  const [code, setCode] = useState("");

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
    const endpointUser = url.endpoint + "sender";
    // const endpointReceiver = "http://localhost:3001/receiver";

    const updateState = (userData) => {
      //receiverData) => {
      console.log("user data: ", userData);
      // console.log("receiver data: ", receiverData);
      console.log("update state", state);
      setState((prev) => {
        const newState = {
          ...prev,
          sender_id: userData.id,
          sender_name: userData.name,
          // reciever_id: receiverData[0].id,
          // reciever_name: receiverData[0].name,
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

        // const receiverRes = await fetch(endpointReceiver, {
        //   method: "GET",
        //   headers: {
        //     Accept: "application/json",
        //     Authorization: "Bearer " + token.accessToken,
        //   },
        // });

        // if (!receiverRes.ok) {
        //   throw new Error("Receiver not found!");
        // }

        // const receiverData = await receiverRes.json();

        updateState(userData); //, receiverData);
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
    const endpointSend = url.endpoint + "send-message";
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

  const createCode = async () => {
    try {
      const endpointCreateInv = url.endpoint + "create-invite"
      const response = await fetch(endpointCreateInv, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
        body: JSON.stringify({
          channel_id: cid,
        }),
      });
      if (!response.ok) {
        throw new Error("Request failed with status: " + response.status);
      }
      console.log("response code", response);
      try {
        const data = await response.json();

        if (data) setCode(data.invite_code);
      } catch (err) {
        throw new Error(err);
      }
    } catch (error) {
      alert(error.message);
      console.log(error);
    }
  };

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
            <div className="channel-heading">
              <Link to="../">#Channels</Link>
              <Link to="/channel-options">+</Link>
            </div>
            <div className="channel-container">
              <Routes>
                <Route
                  path="/*"
                  element={
                    <ChannelList
                      token={token}
                      setChannels={setChannels}
                      setChannelId={setChannelId}
                    />
                  }
                />
                <Route
                  path="/channel-options"
                  element={
                    <ChannelOptions
                      token={token}
                      chlname={chlname}
                      setChlname={setChlname}
                      chlnamejoin={chlnamejoin}
                      setChlnamejoin={setChlnamejoin}
                    />
                  }
                />
              </Routes>
            </div>
          </div>
          <div className="message-container-wrap">
            <div className="reciever-profile">
              <p>
                <strong>#</strong> {channelName ? channelName : "channels"}{" "}
                <span className="channel-invite-code">{code ? code : ""}</span>
              </p>
              <div className="create-channel-code">
                {code ? (
                  ""
                ) : (
                  <button
                    className="create-channel-code-btn"
                    onClick={createCode}
                  >
                    Get Code
                  </button>
                )}
              </div>
            </div>
            <div className="message-container">
              <Routes>
                <Route path="/*" element={<SelectChannelPage />} />
                {/* <Route path="/*" element={<ErrorPage />} /> */}
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
                          code={code}
                          setCode={setCode}
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
