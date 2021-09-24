// ****  Client  ****//

const socket = io();

// socket.on("countUpdated", (count) => {
//   console.log("The count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("clecked");
//     socket.emit("increment");
// });

// Elements
const $messageForm = document.querySelector("#chat");
const $messageFormButton = document.querySelector("button");
const $messageFormInput = document.querySelector("input");
const $sendLocationButton = document.querySelector("#location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    username: message.username, // used in chat.html
    url: message.url, //used in index.js
    createdAt: moment(message.createdAt).format("h:mm a"), //used in chat.html
  });
  // Add the HTML to the document
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // Disable
  $messageFormButton.setAttribute("disabled", "disabled");
  //   const inputMessage = document.querySelector("input").value;
  const inputMessage = e.target.elements.text.value;
  socket.emit("sendMessage", inputMessage, (error) => {
    // Abled
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered!");
  });
});

$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    // const lat = position.coords.latitude;
    // const long = position.coords.longitude;
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

//the third argument is the acknolgement function
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
