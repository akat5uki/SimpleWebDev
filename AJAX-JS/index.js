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
