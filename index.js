const _config = {
    // IMPORTANT: Do not hard-code your API key here. 
    // This is a security risk. 
    // In a real application, this should be handled by a backend proxy or environment variables.
    apiKey: "YOUR_API_KEY_HERE",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    aiInstructions: "You are a helpful, general-purpose AI assistant. Your goal is to answer the user\'s questions accurately and concisely. Format your responses using clean HTML. Use headings, lists, and bold text where appropriate to make the information clear and easy to read.",
};

const messagesContainer = document.getElementById('messages');
const inputField = document.getElementById('input-field');
const inputForm = document.getElementById('input-form');

let previousResponseId = null;

inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageText = inputField.value.trim();
    if (messageText) {
        addUserMessage(messageText);
        inputField.value = '';
        await handleBotReply(messageText);
    }
});

function addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.innerHTML = `
        <img src="images/user profile.jpg" alt="User" class="message-avatar">
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(html) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.innerHTML = `
        <img src="images/profile1.jpg" alt="Chatbot" class="message-avatar">
        <div class="message-content">
            ${html}
        </div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// === Typing Animation  ===
function simulateBotReply() {
    removeTypingIndicator();

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.innerHTML = `
        <img src="images/profile1.jpg" alt="Chatbot" class="message-avatar">
        <div class="typing-indicator">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    typingIndicator.id = 'active-typing';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const activeTyping = document.getElementById('active-typing');
    if (activeTyping) {
        messagesContainer.removeChild(activeTyping);
    }
}

async function handleBotReply(userText) {
    simulateBotReply();
    try {
        const botResponse = await getBotReply(userText, previousResponseId);
        removeTypingIndicator();

        if (botResponse && botResponse.choices && botResponse.choices.length > 0) {
            const botHtml = botResponse.choices[0].message.content;
            addBotMessage(botHtml);
            previousResponseId = botResponse.id;
        } else {
            console.log('Bot response structure issue:', botResponse);
            addBotMessage('Sorry, I had trouble getting a response.');
        }
    } catch (error) {
        console.error('Full error details:', error);
        console.error('Error message:', error.message);
        removeTypingIndicator();
        addBotMessage('Sorry, something went wrong. Check console for details.');
    }
}
async function sendOpenAIRequest(text, prevId) {
    const requestBody = {
        model: _config.model,
        messages: [
            { role: 'system', content: _config.aiInstructions },
            { role: 'user', content: text }
        ],
    };

    if (prevId) {
        // Optional: handle previous response ID if needed
    }

    const response = await fetch(_config.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${_config.apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    return await response.json();
}

async function getBotReply(text, previous_response_id) {
    return await sendOpenAIRequest(text, previous_response_id);
}

// === Theme Switcher ===
const themeSwitcher = document.getElementById('theme-switcher');
const body = document.body;

themeSwitcher.addEventListener('change', () => {
    body.classList.toggle('dark-theme');
    const isDarkMode = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeSwitcher.checked = true;
    } else {
        body.classList.remove('dark-theme');
        themeSwitcher.checked = false;
    }
});