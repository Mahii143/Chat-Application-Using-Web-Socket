import React, { useEffect } from "react";
import { ReadyState } from "react-use-websocket";
import dateFormat from "dateformat";
import url from "./endpoint";

const MessageBox = ({
  token,
  data,
  state,
  channel,
  setData,
  sendMessage,
  readyState,
  messageHistory,
  setMessageHistory,
  channelName,
  setChannelName,
  code,
  setCode,
}) => {
  useEffect(() => {
    const getCode = async () => {
      try {
        const endpointGetInv = url.endpoint + "get-invite";
        const response = await fetch(endpointGetInv, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token.accessToken,
          },
          body: JSON.stringify({
            channel_id: channel,
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
          setCode("");
          throw new Error("No invite code found for channel");
        }
      } catch (error) {
        console.log(error);
      }
    };
    getCode();
    // eslint-disable-next-line
  }, [channel]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpointChnlMsg = url.endpoint + "channel-messages";
        const response = await fetch(endpointChnlMsg, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token.accessToken,
          },
          body: JSON.stringify({ channel_id: channel }),
        });

        if (!response.ok) {
          throw new Error("Request failed with status: " + response.status);
        }

        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error(error);
        // Handle error state or display an error message to the user
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [channel]);

  useEffect(() => {
    if (ReadyState.OPEN === readyState) {
      sendMessage(
        JSON.stringify({
          message: "connected to channel",
          channel: channel,
          prevChannel: messageHistory
            ? messageHistory[messageHistory.length - 1]
            : null,
        })
      );
      setMessageHistory([...messageHistory, channel]);
    }
    // eslint-disable-next-line
  }, [channel, readyState]);

  useEffect(() => {
    setChannelName(channelName);
    // eslint-disable-next-line
  }, [channelName]);

  if (data.length > 0) {
    return (
      <>
        {data.map((object, index) => {
          const timestamp = dateFormat(
            new Date(parseInt(object.timestamp)),
            "hh:MM TT dS mmm"
          );
          // console.log(timestamp);
          // console.log(dateFormat(new Date(parseInt(object.timestamp)), "HH:MM TT dd mmm"));
          return (
            <div className="message-box" key={index}>
              <div
                className={
                  "message " +
                  (object.sender_id === state.sender_id ? "sender" : "reciever")
                }
              >
                <p className="sender-name">
                  {object.sender_id !== state.sender_id
                    ? object.sender_name
                    : ""}{" "}
                  <span className="time-of-msg">{" " + timestamp}</span>
                </p>
                <p>
                  {" "}
                  {(object.sender_id === state.sender_id ? "" : "~ ") +
                    object.content}
                </p>
              </div>
            </div>
          );
        })}
      </>
    );
  } else {
    return (
      <div className="default-page">
        <p>Say something... &#9997;</p>
      </div>
    );
  }
};

export default MessageBox;
