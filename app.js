const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

const historyList = document.querySelector("#historyList");
const clearHistoryBtn = document.querySelector("#clearHistory");

const swapBtn = document.querySelector(".fa-arrow-right-arrow-left");
const themeBtn = document.querySelector("#themeBtn");

for (let select of dropdowns) {
  for (let currCode in countryList) {
    let newOption = document.createElement("option");

    newOption.innerText = currCode;
    newOption.value = currCode;

    if (select.name === "from" && currCode === "USD") {
      newOption.selected = true;
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = true;
    }

    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

const updateExchangeRate = async (saveToHistory = true) => {
  let amount = document.querySelector(".amount input");
  let amtVal = parseFloat(amount.value);

  if (isNaN(amtVal) || amtVal <= 0) {
    msg.innerText = "Please enter a valid amount greater than 0.";
    return;
  }

  msg.innerText = "Getting exchange rate...";
  msg.classList.add("loading");

  try {
    const URL = `${BASE_URL}/${fromCurr.value.toLowerCase()}.json`;

    let response = await fetch(URL);

    // Check if API request was successful
    if (!response.ok) {
      throw new Error("Unable to fetch exchange rate.");
    }

    let data = await response.json();

    let rate =
      data[fromCurr.value.toLowerCase()][toCurr.value.toLowerCase()];

    if (!rate) {
      throw new Error("Exchange rate not available.");
    }

    let finalAmount = amtVal * rate;
    let formattedAmount = finalAmount.toFixed(2);

    msg.classList.remove("loading");
    msg.innerText = `${amtVal} ${fromCurr.value} = ${formattedAmount} ${toCurr.value}`;

    if (saveToHistory) {
  saveConversion({
    amount: amtVal,
    from: fromCurr.value,
    result: formattedAmount,
    to: toCurr.value
  });

  displayHistory();
}

  } catch (error) {
    msg.classList.remove("loading");
    msg.innerText = "Unable to fetch exchange rate. Please try again.";

    console.error("Currency API Error:", error);
  }
};

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];

  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;

  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

const saveConversion = (conversion) => {
  let history = JSON.parse(localStorage.getItem("conversionHistory")) || [];

  history.unshift(conversion);

  // Keep only the latest 5 conversions
  history = history.slice(0, 5);

  localStorage.setItem("conversionHistory", JSON.stringify(history));
};

const displayHistory = () => {
  let history = JSON.parse(localStorage.getItem("conversionHistory")) || [];

  historyList.innerHTML = "";

  history.forEach((conversion) => {
    let li = document.createElement("li");

    li.innerText =
      //`${conversion.amount} ${conversion.from} = ${Number(conversion.result).toFixed(2)} ${conversion.to}`
      `${conversion.amount} ${conversion.from} = ${conversion.result} ${conversion.to}`;

    historyList.append(li);
  });
};

btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

window.addEventListener("load", () => {
  displayHistory();
  updateExchangeRate(false);
});

swapBtn.addEventListener("click", () => {
  let temp = fromCurr.value;

  fromCurr.value = toCurr.value;
  toCurr.value = temp;

  updateFlag(fromCurr);
  updateFlag(toCurr);

  updateExchangeRate();
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeBtn.innerText = "☀️ Light Mode";
  } else {
    themeBtn.innerText = "🌙 Dark Mode";
  }
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("conversionHistory");
  displayHistory();
});