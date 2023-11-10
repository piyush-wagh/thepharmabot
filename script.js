const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
// API key should be kept secure on the server-side
const API_KEY = "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";

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>The Pharmabot</h1>
                            <p>Start a conversation and explore the power of AI.<br>Created by 4 dumb ENGINEERS.<br> Kindly co-operate with us. <br> </p>
                            <h2>Thank You!</h2>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const createIncomingChatElement = (content, className) => {
    const incomingChatDiv = document.createElement("div");
    incomingChatDiv.classList.add("chat", className);
    incomingChatDiv.innerHTML = content;
    return incomingChatDiv;
}

const createOutgoingChatElement = (content, className) => {
    const outgoingChatDiv = document.createElement("div");
    outgoingChatDiv.classList.add("chat", className);
    outgoingChatDiv.innerHTML = content;
    return outgoingChatDiv;
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const responseParagraph = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        console.log("OpenAI API Response:", response);
        if (response.choices && response.choices.length > 0) {
            responseParagraph.textContent = response.choices[0].text.trim();
        } else {
             throw new Error("Invalid response structure from OpenAI API");
        }
    } catch (error) {
        console.error("Error fetching response from OpenAI API:", error);
        responseParagraph.classList.add("error");
        responseParagraph.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }
    

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(responseParagraph);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}


const copyButton = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyButton(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;

    const incomingChatDiv = createIncomingChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createOutgoingChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const newTheme = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    localStorage.setItem("themeColor", newTheme);
    themeButton.innerText = newTheme;
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);
