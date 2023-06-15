import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import url from "./endpoint";

const ChannelList = ({ token, setChannels, setChannelId }) => {
  const [channel, setChannel] = useState([]);
  const params = useParams();
  useEffect(() => {
    setChannelId(params["*"]);
    // eslint-disable-next-line
  }, [params["*"]]);
  // useState(()=>console.log(channel),[channel]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpointChannelParticipants =
          url.endpoint + "channel-participating";
        const endpointGetChannel = url.endpoint + "get-channel";

        const responseChannelParticipants = await fetch(
          endpointChannelParticipants,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + token.accessToken,
            },
          }
        );
        const channelParticipantsData =
          await responseChannelParticipants.json();
        // setUserchannel(channelParticipantsData);

        const fetchChannelData = async (chl) => {
          const responseGetChannel = await fetch(endpointGetChannel, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + token.accessToken,
            },
            body: JSON.stringify({
              channel_id: chl.channel_id,
            }),
          });
          const channelData = await responseGetChannel.json();
          return channelData;
        };

        const mergedChannels = [];
        for (const chl of channelParticipantsData) {
          const channelData = await fetchChannelData(chl);
          mergedChannels.push(...channelData);
        }
        console.log(mergedChannels);
        setChannel(mergedChannels);
        setChannels(mergedChannels);
      } catch (error) {
        console.error("Error fetching channel data:", error);
      }
    };

    fetchData();

    // eslint-disable-next-line
  }, []);

  return (
    <>
      {channel.map((object) => {
        return (
          <Link
            to={"/" + object.channel_id}
            key={object.channel_id}
            className="channel-box"
            onClick={() => {
              setChannelId(object.channel_id);
            }}
          >
            <p>{"# " + object.channel_name}</p>
          </Link>
        );
      })}
    </>
  );
};

export default ChannelList;
