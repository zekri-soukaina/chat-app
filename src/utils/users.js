const users = [];

const addUser = ({ id, username, room }) => {
  // Clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  // Validate data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }
  // check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }
  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  // FindIndex to find the position in the array
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    // Splice to remove user by there index
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};
//*** tests ***/
// addUser({
//   id: 1,
//   username: " SoukaiNA",
//   room: " taLK   ",
// });
// addUser({
//   id: 1,
//   username: " SoukaiNA",
//   room: " chat   ",
// });
// const res = addUser({
//   id: 1009,
//   username: "tara",
//   room: "talk",
// });

// console.log(res);
// console.log(users);

// const removedUser = removeUser(1);
// console.log(removedUser);
// console.log(users);

// const theOne = getUser(109);
// console.log(theOne);

// const many = getUsersInRoom("chat");
// console.log(many);

module.exports = {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
};
