import React, { useEffect } from "react";
import { ReadyState } from "react-use-websocket";

const month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
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
}) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3002/channel-messages", {
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
                  <span className="time-of-msg">
                    {" " +
                      new Date(parseInt(object.timestamp)).getHours() +
                      ":" +
                      (new Date(parseInt(object.timestamp)).getMinutes() < 10
                        ? "0"
                        : "") +
                      new Date(parseInt(object.timestamp)).getMinutes() +
                      " " +
                      month[
                        new Date(parseInt(object.timestamp)).getMonth() - 1
                      ] +
                      " " +
                      new Date(parseInt(object.timestamp)).getDate()}
                  </span>
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
