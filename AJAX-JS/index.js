let global_count = 0;

async function sendAJAX(http_method, url, func, args) {
  const xhttp = new XMLHttpRequest();
  xhttp.responseType = "text";
  xhttp.onload = function () {
    func(this, args);
  };
  xhttp.open(http_method, url);
  xhttp.send();
}

async function myfunc1(xhttp, args) {
  const doc = await Text2HTML(xhttp.responseText);
  let reqTag1 = doc.getElementById(args[0]).innerHTML;
  let reqTag2 = doc.getElementById(args[1]).innerHTML;
  let reqTag = reqTag1 + " " + reqTag2;
  document.getElementById("test1").innerHTML = reqTag;
}

async function Text2HTML(txt) {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(txt, "text/html");
  return htmlDoc;
}

async function loadDoc1() {
  // sendAJAX("GET", "/AJAX-JS/assets/display.txt", myfunc1);
  sendAJAX("GET", "/", myfunc1, ["hello", "test2"]);
}

async function updateCount(xhttp, args) {
  // const doc = await Text2HTML(xhttp.responseText);
  // let count = global_count;

  if (args[1] === "add") {
    global_count += 1;
  } else if (args[1] === "sub") {
    global_count -= 1;
  } else {
    global_count = 0;
  }

  document.getElementById(args[0]).innerText = global_count;
  // global_count = count;
}

async function addOne() {
  sendAJAX("GET", "/", updateCount, ["count", "add"]);
}

async function subOne() {
  sendAJAX("GET", "/", updateCount, ["count", "sub"]);
}

async function resetCount() {
  sendAJAX("GET", "/", updateCount, ["count", "reset"]);
}

// FastAPI

(function () {
  "use strict";
  let _signin = true;
  window.setSignin = function (value) {
    _signin = value;
  };
  window.getSignin = function () {
    return _signin;
  };
  const _ws = new WebSocket("ws://127.0.0.1:8000/api/v1/chat/", "wamp");
  window.getWebSoc = function () {
    return _ws;
  };
})();

async function checkSessionTimeout() {
  "use strict";
  displayChatArea(true);
  const token = await getAccessToken();
  if (typeof token === "string") {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = new Date(payload["exp"] * 1000);
    const currentTime = new Date();
    if (currentTime > expiryTime) {
      localStorage.removeItem("accessToken");
      displayChatArea(false);
      // wsSetVerifiedStatus(false);
    }
  } else {
    displayChatArea(false);
    // wsSetVerifiedStatus(false);
  }
}

async function displayChatArea(flag) {
  "use strict";
  if (flag) {
    document.getElementById("id-chat-main").style.display = "block";
  } else {
    document.getElementById("id-chat-main").style.display = "none";
  }
}

async function handleFetch(event) {
  "use strict";
  event.preventDefault();

  const url_params = {
    limit: 6,
    skip: 0,
    search: "",
  };
  const url_params_str = new URLSearchParams(url_params).toString();
  const api_url = "http://127.0.0.1:8000/api/v1/users/";
  const url = `${api_url}?${url_params_str}`;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    const resp_json = await response.json();
    const users_div = document.getElementById("id-users");
    users_div.innerText = "";
    if ("content" in document.createElement("template")) {
      const template = document.getElementById("id-template-users");
      resp_json.forEach((ele) => {
        const clone = template.content.cloneNode(true);
        let field_divs = clone.querySelectorAll("div");
        field_divs.forEach((fdiv) => {
          switch (fdiv.getAttribute("id")) {
            case "id-contain":
              fdiv.setAttribute("id", `id-contain-${ele["id"]}`);
              break;

            case "id-email":
              fdiv.setAttribute("id", `id-email-${ele["id"]}`);
              fdiv.setAttribute("name", `user-email-${ele["id"]}`);
              fdiv.textContent = ele["email"];
              break;

            case "id-id":
              fdiv.setAttribute("id", `id-id-${ele["id"]}`);
              fdiv.setAttribute("name", `user-id-${ele["id"]}`);
              fdiv.textContent = ele["id"];
              break;

            case "id-created":
              fdiv.setAttribute("id", `id-created-${ele["id"]}`);
              fdiv.setAttribute("name", `user-created-${ele["id"]}`);
              fdiv.textContent = ele["created_at"];
              break;

            default:
              break;
          }
        });
        clone.firstElementChild.addEventListener("click", () => {
          console.info("Hello User ", ele["email"]);
          wsSetReceiver(ele["id"]);
        });
        users_div.appendChild(clone);
      });
    } else {
      throw new Error("Template tag not supported");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function fetchUser(event) {
  "use strict";
  event.preventDefault();

  const user_id = event.target.elements["id-id-g"].value;
  event.target.elements["id-id-g"].value = "";
  const api_url = "http://127.0.0.1:8000/api/v1/users/";
  const url = `${api_url}${user_id}`;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    const resp_json = await response.json();
    const user_div = document.getElementById("id-user");
    user_div.innerText = "";
    if (!response.ok) {
      const err_div = document.createElement("div");
      err_div.innerText = resp_json["detail"];
      err_div.setAttribute("class", "div-cont div-color div-text");
      user_div.appendChild(err_div);
      throw new Error(resp_json["detail"]);
    }
    if ("content" in document.createElement("template")) {
      const template = document.getElementById("id-template-users");
      const clone = template.content.cloneNode(true);
      let field_divs = clone.querySelectorAll("div");
      field_divs.forEach((fdiv) => {
        switch (fdiv.getAttribute("id")) {
          case "id-email":
            fdiv.textContent = resp_json["email"];
            break;

          case "id-id":
            fdiv.textContent = resp_json["id"];
            break;

          case "id-created":
            fdiv.textContent = resp_json["created_at"];
            break;

          default:
            break;
        }
      });
      user_div.appendChild(clone);
    } else {
      throw new Error("Template tag not supported");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function prepareSignUp() {
  "use strict";
  setSignin(false);
}

async function prepareSignIn() {
  "use strict";
  setSignin(true);
}

async function userLogout() {
  "use strict";
  localStorage.removeItem("accessToken");
  displayChatArea(false);
  // const ws_close = window.getWebSoc();
  // ws_close.close(1000, "User Logged out");
  console.log("Logout Successful");
  // wsSetVerifiedStatus(false);
}

async function setAccessToken(token) {
  "use strict";
  localStorage.setItem("accessToken", token);
}

async function getAccessToken() {
  "use strict";
  return localStorage.getItem("accessToken");
}

async function formUserAction(event) {
  "use strict";
  event.preventDefault();

  const user_email = event.target.elements["id-email-c"].value;
  const user_pass = event.target.elements["id-pass-c"].value;
  event.target.elements["id-email-c"].value = "";
  event.target.elements["id-pass-c"].value = "";
  const user_div = document.getElementById("id-create-out");
  user_div.innerText = "";

  if (getSignin()) {
    // console.log("Sign in");
    const request = {
      grant_type: "password",
      username: user_email,
      password: user_pass,
    };
    const reqBody = new URLSearchParams(request).toString();
    const url = "http://127.0.0.1:8000/api/v1/login/";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: reqBody,
      credentials: "include",
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("Token generation Failed");
      }
      const res_json = await response.json();
      // console.log(document.cookie);
      setAccessToken(res_json["access_token"]);
      displayChatArea(true);
      // const ws_msg = window.getWebSoc();
      // await wsReceiveMsg(ws_msg);
    } catch (error) {
      console.error("Error: ", error);
      displayChatArea(false);
    }
  } else {
    // console.log("Sign up");
    const url = "http://127.0.0.1:8000/api/v1/users/";
    const request = {
      email: user_email,
      password: user_pass,
    };
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(request),
    };
    try {
      const response = await fetch(url, options);
      const res_json = await response.json();
      if (!response.ok) {
        const err_div = document.createElement("div");
        err_div.innerText = "User creation failed"; // res_json["detail"];
        err_div.setAttribute("class", "div-cont div-color div-text");
        user_div.appendChild(err_div);
        throw new Error(err_div.innerText);
      }
      if ("content" in document.createElement("template")) {
        const template = document.getElementById("id-template-users");
        const clone = template.content.cloneNode(true);
        let field_divs = clone.querySelectorAll("div");
        field_divs.forEach((fdiv) => {
          switch (fdiv.getAttribute("id")) {
            case "id-contain":
              fdiv.setAttribute("id", "id-contain-co");
              break;

            case "id-msg":
              fdiv.setAttribute("id", "id-msg-co");
              fdiv.setAttribute("name", "msg-co");
              fdiv.textContent = "New user created";
              break;

            case "id-email":
              fdiv.setAttribute("id", "id-email-co");
              fdiv.setAttribute("name", "user-email-co");
              fdiv.textContent = res_json["email"];
              break;

            case "id-id":
              fdiv.setAttribute("id", "id-id-co");
              fdiv.setAttribute("name", "user-id-co");
              fdiv.textContent = res_json["id"];
              break;

            case "id-created":
              fdiv.setAttribute("id", "id-created-co");
              fdiv.setAttribute("name", "user-created-co");
              fdiv.textContent = res_json["created_at"];
              break;

            default:
              break;
          }
        });
        user_div.appendChild(clone);
      } else {
        throw new Error("Template tag not supported");
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }
}

async function getAllItems() {
  "use strict";
  const k = await getAccessToken();
  console.log(k);
  const url = "http://127.0.0.1:8000/api/v1/items/";
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${k}`,
      Accept: "application/json",
    },
  };
  try {
    const response = await fetch(url, options);
    const res_json = await response.json();
    if (!response.ok) {
      throw new Error("Unable to fetch items");
    }
    console.log(res_json);
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function wsSetReceiver(uid) {
  "use strict";
  localStorage.setItem("chatting_with", uid);
}

async function wsGetReceiver() {
  "use strict";
  return localStorage.getItem("chatting_with");
}

// async function wsSetVerifiedStatus(flag) {
//   "use strict";
//   const token = await getAccessToken();
//   // console.log("flag", typeof flag, flag);
//   if (!token) {
//     flag = false;
//   }
//   localStorage.setItem("ws_auth_status", flag);
// }

// async function wsGetVerifiedStatus() {
//   "use strict";
//   return localStorage.getItem("ws_auth_status");
// }

async function wsReceiveMsg(ws) {
  "use strict";
  ws.onmessage = (ev) => {
    const messages = document.getElementById("id-msgs");
    const message = document.createElement("li");
    const content = document.createTextNode(ev.data);
    message.appendChild(content);
    messages.appendChild(message);
  };
}

async function wsSendMessage(event) {
  "use strict";
  event.preventDefault();
  const receiverId = await wsGetReceiver();
  const ws = window.getWebSoc();
  const input = document.getElementById("id-msg-text");
  const tstamp = Date.now();
  const msg = {
    access_token: await getAccessToken(),
    text: input.value,
    receiver: receiverId,
  };
  try {
    ws.send(JSON.stringify(msg), tstamp);
    await wsReceiveMsg(ws);
    input.value = "";
  } catch (error) {
    console.log("Error: ", error);
  }
}

async function Main() {
  "use strict";
  document
    .getElementById("id-get-users")
    .addEventListener("click", handleFetch);
  checkSessionTimeout();

  // const ws_g = await window.getWebSoc();
  // ws_g.onmessage = (ev) => {
  //   const messages = document.getElementById("id-msgs");
  //   const message = document.createElement("li");
  //   const content = document.createTextNode(ev.data);
  //   message.appendChild(content);
  //   messages.appendChild(message);
  // }
  // wsSetVerifiedStatus(false);
}

document.addEventListener("DOMContentLoaded", Main);
