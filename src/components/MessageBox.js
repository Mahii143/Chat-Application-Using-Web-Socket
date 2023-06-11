import React, { useEffect } from "react";

const MessageBox = ({ token, data, state, channel, setData }) => {
  //   const [data, setData] = useState([]);
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
  }, [channel]);

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
};

export default MessageBox;
