import "../../css/style.scss";

const mainContentEl = document.querySelector("#main-content"); // Provided by Tamar Auber
const alertBoxEl = document.querySelector("#alert-box"); // Provided by Tamar Auber
const roomIdEl = document.querySelector("#room-id"); // 4.1.6 Update Room to Display Room URL for Copying
const clipboardBtn = document.querySelector("#clipboard-btn"); // 4.1.6 Copy Room URL with Clipboard API
const localUserEl = document.querySelector("#local-username"); // Provided by Tamar Auber
const remoteUserEl = document.querySelector("#remote-username"); // Provided by Tamar Auber
const startCallBtnEl = document.querySelector("#start-call-btn"); // Provided by Tamar Auber
const stopCallBtnEl = document.querySelector("#stop-call-btn"); // Provided by Tamar Auber

const localVideoEl = document.querySelector("#local-video"); // 4.2.3 Build Video Element
const remoteVideoEl = document.querySelector("#remote-video"); // 4.2.3 Build Video Element

let roomId = null; // 4.1.6 Update Room to Display Room URL for Copying
let stream = null; // 4.2.3 Stream Webcam to Page

const getQueryStringParams = (query) => {
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query)
        .split("&")
        .reduce((params, param) => {
          let [key, value] = param.split("=");
          params[key] = value
            ? decodeURIComponent(value.replace(/\+/g, " "))
            : "";
          return params;
        }, {})
    : {};
}; // 4.1.6 Update Room to Display Room URL for Copying

const getRoomId = () => {
  const params = getQueryStringParams(document.location.search);
  roomId = params.roomId;
  roomIdEl.textContent = roomId;
  return params.roomId;
}; // 4.1.6 Update Room to Display Room URL for Copying

getRoomId(); // 4.1.6 Update Room to Display Room URL for Copying

const copyToClipboard = async () => {
  if (!navigator.clipboard) {
    // Clipboard API not available
    return;
  }
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch (err) {
    console.error("Failed to copy!", err);
  }
}; // 4.1.6 Copy Room URL with Clipboard API

const startVideo = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 640, ideal: 1920 },
        height: { min: 400, ideal: 1080 },
        aspectRatio: { ideal: 1.7777777778 },
      },
      audio: true,
    });
    localVideoEl.srcObject = mediaStream;
    stream = mediaStream;

    return mediaStream;
  } catch (err) {
    console.error(err);
  }
}; // 4.2.3 Stream Webcam to Page

clipboardBtn.addEventListener("click", copyToClipboard); // 4.1.6 Copy Room URL with Clipboard API

startVideo(); // 4.2.3 Stream Webcam to Page
