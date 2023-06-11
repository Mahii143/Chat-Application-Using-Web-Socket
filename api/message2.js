const Pool = require("pg").Pool;
const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "chatapp",
  password: "admin",
  port: 5432,
});
const uuid = require("uuid");

//getting all channels of a userid
const getChannelsOfUser = (id) => {
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT part_id, part_user_id, part_role, channel_id FROM public."ChannelParticipants" WHERE part_user_id = $1',
      [id],
      (error, result) => {
        if (error) reject(error);
        if (result && result.rows) {
          resolve(result.rows);
        } else {
          reject(
            new Error("Query result is undefined or missing rows property")
          );
        }
      }
    );
  });
};

// checking user is part of channel
const checkUserChannel = (user_id, channel_id) => {
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT EXISTS ( SELECT 1 FROM public."ChannelParticipants" WHERE part_user_id = $1 AND channel_id = $2 ) AS is_authorised',
      [user_id, channel_id],
      (error, result) => {
        if (error) reject(error);
        if (result && result.rows) {
          resolve(result.rows);
        } else {
          reject(
            new Error("Query result is undefined or missing rows property")
          );
        }
      }
    );
  });
};

// getting all messages of a channel
const getMessagesOfChannel = (id) => {
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT message_id, channel_id, sender_id, content, timestamp FROM public."MessageHistory" WHERE channel_id = $1 ORDER BY timestamp DESC',
      [id],
      (error, result) => {
        if (error) reject(error);
        if (result && result.rows) {
          resolve(result.rows);
        } else {
          reject(
            new Error("Query result is undefined or missing rows property")
          );
        }
      }
    );
  });
};

//getting channel data
const getChannel = (id) => {
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT channel_id, channel_name, channel_admin FROM public."Channels" WHERE channel_id = $1',
      [id],
      (error, result) => {
        if (error) reject(error);
        if (result && result.rows) {
          resolve(result.rows);
        } else {
          reject(
            new Error("Query result is undefined or missing rows property")
          );
        }
      }
    );
  });
};

// sending a message to db
const sendMessage = (req) => {
  return new Promise(function (resolve, reject) {
    const mid = uuid.v4();
    const sender_id = req.user.id;
    const { channel_id, content, timestamp } = req.body;
    // console.log('received datas: ', mid, sender_id, channel_id, content, timestamp);

    if(content === '' || channel_id === '') reject("Can't insert query due to no content or no channel specified error;");

    pool.query(
      'INSERT INTO public."MessageHistory"( message_id, channel_id, sender_id, content, timestamp) VALUES ($1,$2,$3,$4,$5)',
      [mid, channel_id, sender_id, content, timestamp],
      (error, _) => {
        if (error) reject('query error');
        resolve("successfully inserted!");
      }
    );
  });
};

/* ----------------------------------------------- */


const createMessage = (body) => {
  return new Promise(function (resolve, reject) {
    const { senderid, receiverid, content, timestamp } = body;
    pool.query(
      'INSERT INTO public."MessageHistory" ( sender_id, receiver_id, content, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [senderid, receiverid, content, timestamp],
      (error, _) => {
        if (error) reject(error);
        resolve(
          JSON.stringify({
            sender_id: senderid,
            reciever_id: receiverid,
            content: content,
            timestamp: timestamp,
          })
        );
      }
    );
  });
};

module.exports = {
  getChannelsOfUser,
  checkUserChannel,
  getMessagesOfChannel,
  getChannel,
  sendMessage,
  createMessage,
};
