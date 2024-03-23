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

async function handleFetch(event) {
  event.preventDefault();

  const url_params = {
    limit: 10,
    skip: 0,
    search: "",
  };
  const url_params_str = new URLSearchParams(url_params).toString();
  const api_url = "http://127.0.0.1:8000/api/v1/users/";
  const url = `${api_url}?${url_params_str}`;
  const options = {
    method: "GET",
    headers: {
      // Authorization: "Bearer {personal_access_token}",
      Accept: "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    resp_json = await response.json();
    console.log(resp_json);
    // event.target.innerText = JSON.stringify(resp_json);

    const users_div = document.getElementById("id-users");
    users_div.innerText = "";
    if ("content" in document.createElement("template")) {
      const template = document.getElementById("id-template-users");
      resp_json.forEach((ele) => {
        const clone = template.content.cloneNode(true);
        let field_divs = clone.querySelectorAll("div");
        console.log(field_divs[0].getAttribute("id"));
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
        // field_divs[1].textContent = ele["email"];
        // field_divs[2].textContent = ele["id"];
        // field_divs[3].textContent = ele["created_at"];
        users_div.appendChild(clone);
      });
    } else {
      throw new Error("Template tag not supported");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function Main() {
  document.getElementById("id-get-data").addEventListener("click", handleFetch);
}

document.addEventListener("DOMContentLoaded", Main);
