let _config = {
  openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
  openAI_model: "gpt-4o-mini",
  ai_instruction: `You are a teacher who gives questions about JavaScript.
    Output should be in HTML format.
    Do not use markdown format; answer directly.`,
  response_id: "",
};

// Unified, cleaned-up request function
async function sendOpenAIRequest(text) {
  const requestBody = {
    model: _config.openAI_model,
    input: text,
    instructions: _config.ai_instruction,
  };

  try {
    const response = await fetch(_config.openAI_api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    const output = data.output?.[0]?.content?.[0]?.text || "No response text found.";
    _config.response_id = data.id || "";

    return output;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// === Chat UI Elements ===
const messagesContainer = document.getElementById("messages");
const inputField = document.getElementById("input-field");
const inputForm = document.getElementById("input-form");

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageText = inputField.value.trim();
  if (!messageText) return;

  addUserMessage(messageText);
  inputField.value = "";
  await handleBotReply(messageText);
});

// === Message Functions ===
function addUserMessage(text) {
  const messageElement = document.createElement("div");
  messageElement.className = "message user-message";
  messageElement.innerHTML = `
    <img src="images/user profile.jpg" alt="User" class="message-avatar">
    <div class="message-content"><p>${text}</p></div>
  `;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(html) {
  const messageElement = document.createElement("div");
  messageElement.className = "message bot-message";
  messageElement.innerHTML = `
    <img src="images/profile1.jpg" alt="Chatbot" class="message-avatar">
    <div class="message-content">${html}</div>
  `;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// === Typing Indicator ===
function simulateBotReply() {
  removeTypingIndicator();

  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message bot-message typing";
  typingIndicator.innerHTML = `
    <img src="images/profile1.jpg" alt="Chatbot" class="message-avatar">
    <div class="typing-indicator"><div class="typing-dots"><span></span><span></span><span></span></div></div>
  `;
  typingIndicator.id = "active-typing";
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const activeTyping = document.getElementById("active-typing");
  if (activeTyping) messagesContainer.removeChild(activeTyping);
}

// === Bot Reply Handler ===
async function handleBotReply(userText) {
  simulateBotReply();

  try {
    const botResponse = await sendOpenAIRequest(userText);
    removeTypingIndicator();
    addBotMessage(botResponse);
  } catch (error) {
    console.error("Error:", error);
    removeTypingIndicator();
    addBotMessage("Sorry, something went wrong. Please try again.");
  }
}

// === Theme Switcher ===
const themeSwitcher = document.getElementById("theme-switcher");
const body = document.body;

themeSwitcher.addEventListener("change", () => {
  body.classList.toggle("dark-theme");
  const isDarkMode = body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeSwitcher.checked = true;
  } else {
    body.classList.remove("dark-theme");
    themeSwitcher.checked = false;
  }
});