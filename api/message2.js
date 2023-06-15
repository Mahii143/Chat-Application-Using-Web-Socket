const Pool = require("pg").Pool;
const InviteCode = require("./invitecode");
const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "chatapp",
  password: "admin",
  port: 5432,
});
const uuid = require("uuid");

/****************** get methods starts ******************/
// getting all users
const getUsers = () => {
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT id, name, password FROM public."User"',
      (error, result) => {
        if (error) reject("query error");
        if (result && result.rows) resolve(result.rows);
        else
          reject(
            new Error("Query result is undefined or missing rows property")
          );
      }
    );
  });
};

//getting all channels of a userid
const getChannelsOfUser = (id) => {
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT DISTINCT part_id, part_user_id, part_role, channel_id FROM public."ChannelParticipants" WHERE part_user_id = $1',
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

// getting participants of a channel
const getUsersOfChannel = (body) => {
  const { channel_id } = body;
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT part_user_id, part_role, channel_id FROM public."ChannelParticipants" WHERE channel_id = $1',
      [channel_id],
      (error, result) => {
        if (error) reject("query error");
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
        if (error) reject("query error");
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
        if (error) reject("query error 1");
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

/****************** get methods ends ******************/

/****************** post methods starts ****************/

// creating an user
const createUser = (body) => {
  const id = uuid.v4();
  const { name, password } = body;

  return new Promise(function (resolve, reject) {
    pool.query(
      'INSERT INTO public."User" (id, name, password) VALUES ($1, $2, $3)',
      [id, name, password],
      (error, result) => {
        if (error) reject(error);
        resolve("user created successfully");
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

    if (content === "" || channel_id === "")
      reject(
        "Can't insert query due to no content or no channel specified error;"
      );

    pool.query(
      'INSERT INTO public."MessageHistory"( message_id, channel_id, sender_id, content, timestamp) VALUES ($1,$2,$3,$4,$5)',
      [mid, channel_id, sender_id, content, timestamp],
      (error, _) => {
        if (error) reject("query error");
        resolve(
          JSON.stringify({
            message_id: mid,
            channel_id: channel_id,
            sender_id: sender_id,
            content: content,
            timestamp: timestamp,
          })
        );
      }
    );
  });
};

// creating a new channel
const createChannel = (req) => {
  const channel_admin = req.user.id;
  // console.log(channel_admin);
  const channel_id = uuid.v4();
  const { channel_name } = req.body;
  return new Promise(async function (resolve, reject) {
    pool.query(
      'INSERT INTO public."Channels" (channel_id, channel_name, channel_admin) VALUES ($1, $2, $3)',
      [channel_id, channel_name, channel_admin],
      (error, _) => {
        if (error) reject(error);
      }
    );
    req.body.channel_id = channel_id;
    req.body.part_role = "admin";
    try {
      await joinChannel(req);
    } catch (error) {
      resolve(error);
    }
    resolve("channel successfully created");
  });
};

// joining the channel
const joinChannel = (req) => {
  const part_id = uuid.v4();
  const part_user_id = req.user.id;
  const channel_id = req.body.channel_id;
  const part_role = req.body.part_role ? req.body.part_role : "member";

  console.log("joining channel", req.body);
  return new Promise(function (resolve, reject) {
    if(channel_id === '') reject('no channel found');
    pool.query(
      'SELECT EXISTS ( SELECT 1 FROM public."ChannelParticipants" WHERE part_user_id = $1 AND channel_id = $2 ) AS is_exist',
      [part_user_id, channel_id],
      (error, result) => {
        if (error) reject("query error");
        if (result.rows[0].is_exist)
          reject("user already a member of the channel");
        console.log(result.rows[0].is_exist);
        pool.query(
          'INSERT INTO public."ChannelParticipants"( part_id, part_user_id, part_role, channel_id) VALUES ($1, $2, $3, $4)',
          [part_id, part_user_id, part_role, channel_id],
          (error, _) => {
            if (error) reject("query error");
            resolve("joined the channel successfully");
          }
        );
      }
    );
  });
};

// check admin or not
const checkAdmin = (user_id, channel_id) => {
  // 'SELECT EXISTS ( SELECT 1 FROM public."ChannelParticipants" WHERE part_user_id = $1 AND channel_id = $2 ) AS is_authorised',
  const role = "admin";
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT EXISTS ( SELECT 1 FROM public."ChannelParticipants" WHERE part_user_id = $1 AND channel_id = $2 AND part_role = $3 ) AS is_authorised',
      [user_id, channel_id, role],
      (error, result) => {
        if (error) reject("query error");
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

// creating an invite code
const createInviteCode = (body) => {
  const invite_id = uuid.v4();
  const invite_code = InviteCode.generateUniqueCode();
  const { channel_id } = body;
  return new Promise(async function (resolve, reject) {
    pool.query(
      'INSERT INTO public."InviteCode" (invite_id, invite_code, channel_id) VALUES ($1, $2, $3)',
      [invite_id, invite_code, channel_id],
      (error, _) => {
        if (error) reject(error);
        resolve(JSON.stringify({ invite_code: invite_code }));
      }
    );
  });
};

// get channel id from invite code

const getInviteChannel = (body) => {
  const { invite_code } = body;
  return new Promise(function (resolve, reject) {
    pool.query(
      'SELECT channel_id FROM public."InviteCode" WHERE invite_code = $1',
      [invite_code],
      (error, result) => {
        if (error) reject("query error");
        if (result && result.rows) {
          resolve(JSON.stringify(result.rows[0]));
        } else {
          reject(
            new Error("Query result is undefined or missing rows property")
          );
        }
      }
    );
  });
};

// get invite code from channel id
const getInviteCode = (body) => {
  const { channel_id } = body;
  return new Promise(async function (resolve, reject) {
    pool.query(
      'SELECT invite_code FROM public."InviteCode" WHERE channel_id = $1',
      [channel_id],
      (error, result) => {
        if (error) reject("query error");
        if (result && result.rows) {
          resolve(JSON.stringify(result.rows[0]));
        } else {
          reject(
            new Error("Query result is undefined or missing rows property")
          );
        }
      }
    );
  });
};

/****************** post methods ends ******************/

module.exports = {
  getUsers,
  getChannelsOfUser,
  getUsersOfChannel,
  checkUserChannel,
  getMessagesOfChannel,
  getChannel,
  createUser,
  sendMessage,
  createChannel,
  joinChannel,
  checkAdmin,
  createInviteCode,
  getInviteChannel,
  getInviteCode,
};
