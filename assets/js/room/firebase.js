import firebase from "./firebase-config";

let database = null;
let userKey = null;
let roomUsername = null;

const checkRoomAvailability = async (database) => {
  try {
    const roomSnapshot = await database.once("value");
    const roomOccupants = roomSnapshot.val();
    if (!roomOccupants) {
      return true;
    }
    if (Object.keys(roomOccupants).length < 2) {
      return true;
    }

    return false;
  } catch (err) {
    console.log(err);
    return err;
  }
};

// updated 4.4.3; updated 4.4.4
export const joinRoom = async (
  roomId,
  username,
  {
    handleUserPresence,
    handleUpdateRemoteFilter,
    handleOfferMessage,
    handleAnswerMessage,
    handleICECandidateMessage,
  }
) => {
  try {
    roomUsername = username;

    // get reference to room
    database = firebase.database().ref(`/rooms/${roomId}`);

    // check if room is full, set `isRoomOpen` to `false` if so
    const isRoomOpen = await checkRoomAvailability(database);
    // if room isn't open
    if (!isRoomOpen) {
      return false;
    }

    // push user into room and create presence
    const user = await database.push({ username });
    userKey = user.path.pieces_.pop();
    // remove user from room if they leave the application
    database.child(`/${userKey}`).onDisconnect().remove();

    initUserListeners(database, handleUserPresence);
    // updated 4.4.3; updated 4.4.4
    initMessageListeners(database, {
      handleUpdateRemoteFilter,
      handleOfferMessage,
      handleAnswerMessage,
      handleICECandidateMessage,
    });

    return true;
  } catch (err) {
    console.log(err);
  }
};

const initUserListeners = (database, handleUserPresence) => {
  database.on("child_added", (userSnapshot) => {
    if (userSnapshot.key !== userKey && userSnapshot.key !== "messages") {
      console.log("User Joined: ", userSnapshot.val());
      handleUserPresence(true, userSnapshot.val().username);
    }
  });

  database.on("child_removed", (userSnapshot) => {
    if (userSnapshot.key !== userKey && userSnapshot.key !== "messages") {
      console.log("User Left: ", userSnapshot.val());
      handleUserPresence(false);
    }
  });
};

// updated 4.4.3; updated 4.4.4
const initMessageListeners = (
  database,
  {
    handleUpdateRemoteFilter,
    handleOfferMessage,
    handleAnswerMessage,
    handleICECandidateMessage,
  }
) => {
  database.child("/messages").on("child_added", (messageSnapshot) => {
    const messageData = messageSnapshot.val();
    if (messageData.username === roomUsername) {
      return;
    }

    switch (messageData.messageType) {
      case "CANVAS_FILTER":
        handleUpdateRemoteFilter(messageData.message);
        break;
      case "OFFER":
        handleOfferMessage(messageData);
        break;
      case "ANSWER":
        handleAnswerMessage(messageData);
        break;
      case "ICE_CANDIDATE":
        handleICECandidateMessage(messageData);
        break;
      default:
        return;
    }
  });
};

export const sendMessage = async ({ messageType, message }) => {
  const messagesRef = database.child("/messages");
  const msg = await messagesRef.push({
    username: roomUsername,
    messageType,
    message,
  });
  msg.remove();
};
