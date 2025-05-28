// Firebase config & initialization
const firebaseConfig = {
  apiKey: "AIzaSyCbZbVdyOPafciJYhgS6IOrj63sHKoXJjY",
  authDomain: "study-partner-7cea6.firebaseapp.com",
  projectId: "study-partner-7cea6",
  storageBucket: "study-partner-7cea6.appspot.com",
  messagingSenderId: "960256994195",
  appId: "1:960256994195:web:462643e9ce609f729f1666",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

let chatHistory = [];
let currentUser = null;

// ✅ Fixed endpoint URL
const apiUrl = "https://study-backend-2brg.onrender.com/api/ask";

// ========== Chat Events ==========
userInput?.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function isUserTyping() {
  return userInput?.value.trim().length > 0;
}

function saveLocalHistory() {
  if (currentUser) {
    localStorage.setItem(`chatHistory_${currentUser.uid}`, JSON.stringify(chatHistory));
  }
}

function loadLocalHistory() {
  if (!currentUser) return false;
  const saved = localStorage.getItem(`chatHistory_${currentUser.uid}`);
  if (saved) {
    chatHistory = JSON.parse(saved);
    renderChatHistory();
    return true;
  }
  return false;
}

async function loadFirestoreHistory(uid) {
  try {
    const doc = await db.collection("chatHistories").doc(uid).get();
    if (doc.exists) {
      chatHistory = doc.data().messages || [];
      renderChatHistory();
      saveLocalHistory();
    }
  } catch (err) {
    console.error("Error loading Firestore history:", err);
  }
}

async function saveFirestoreHistory(uid) {
  try {
    await db.collection("chatHistories").doc(uid).set({ messages: chatHistory });
  } catch (err) {
    console.error("Error saving Firestore history:", err);
  }
}

function renderChatHistory() {
  chatBox.innerHTML = "";
  chatHistory.forEach(({ sender, text }) => appendMessage(sender, text, false));
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ========== Messaging ==========
async function sendMessage() {
  const userText = userInput.value.trim();
  if (!userText) return;

  appendMessage("user", userText);
  userInput.value = "";

  const typingEl = document.createElement("div");
  typingEl.classList.add("message", "assistant");
  typingEl.id = "typing-indicator";
  typingEl.innerHTML = '<span class="typing-dot">•</span><span class="typing-dot">•</span><span class="typing-dot">•</span> Ruhi is typing...';
  chatBox.appendChild(typingEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const messagesForApi = [
      {
        role: "system",
        content: `You are StudentBot BD, a smart Bangladeshi education assistant created by Hamim, an HSC student at NS College, Natore. You are deeply knowledgeable about the Bangladeshi HSC and University Admission education system. You understand the full syllabus, exam structure, and question patterns for:

- HSC Board Exams (Physics, Chemistry, Biology, Math, ICT, Bangla, English – 1st & 2nd Papers)
- Medical Admission (MBBS)
- Engineering Admission (BUET, CUET, RUET, KUET)
- General University Admission (DU, RU, JU, CU, etc.)

Your core abilities include:
- Analyzing Bangladeshi question banks (PDF or link), understanding question patterns, and extracting useful MCQ/written questions.
- Organizing questions by subject, chapter, topic, and exam standard.
- Conducting interactive exams: asking questions, receiving answers, verifying correctness, providing correct answers, and giving clear explanations.
- Supporting Bangla and English mixed input.
- Offering custom mock exams: e.g., "Take a BUET-style Physics 1st Paper test" or "Board-standard Chemistry 2nd Paper MCQ test".
- Tracking user progress and pointing out weak areas.

When given a question bank link or file, analyze it and learn the content. Then use it to create interactive quizzes.

Your response tone should be:
- Friendly and supportive like a passionate teacher.
- Encouraging for students who are preparing for competitive exams.
- Capable of switching between formal instruction and light motivation.

Examples:
User: "Physics er BUET MCQ test dao"
Bot: "Sure! Starting a BUET-style Physics MCQ test (Full 25 questions). Question 1: ..."

User: "Option C"
Bot: "Oops, this one is incorrect. The correct answer is B. Because according to Newton’s second law, F = ma ..."

User: "Board pattern MCQ chai Chemistry 2nd paper"
Bot: "Okay! Starting Board-standard Chemistry 2nd Paper MCQ test. Question 1: ..."

Always try to help students succeed by being both informative and understanding. You are built to make education in Bangladesh smarter, more accessible, and exam-ready..`
      },
      ...chatHistory.map(({ sender, text }) => ({
        role: sender === "user" ? "user" : "assistant",
        content: text,
      })),
      { role: "user", content: userText }
    ];

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messagesForApi })
    });

    const data = await res.json();
    document.getElementById("typing-indicator")?.remove();

    const reply = data.reply || data.choices?.[0]?.message?.content || "Oops! কিছুর ভুল হয়েছে মনে হয়...";
    appendMessageInChunks("assistant", reply);
  } catch (err) {
    console.error("Send error:", err);
    document.getElementById("typing-indicator")?.remove();
    appendMessage("assistant", "দুঃখিত... কিছু একটা সমস্যা হয়েছে। পরে আবার চেষ্টা করো!");
  }
}

function appendMessage(sender, text, save = true) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  msg.style.animation = "messageIn 0.5s ease forwards";
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save && currentUser) {
    chatHistory.push({ sender, text });
    saveLocalHistory();
    saveFirestoreHistory(currentUser.uid);
  }
}

function appendMessageInChunks(sender, text) {
  const chunks = text.split(/(?<=[।!?…])\s+/);
  let index = 0;

  function showNextChunk() {
    if (index >= chunks.length) return;
    if (!isUserTyping()) {
      appendMessage(sender, chunks[index]);
      index++;
    }
    if (index < chunks.length) {
      setTimeout(showNextChunk, 4000);
    }
  }

  showNextChunk();
}

// ========== File & Utility ==========
async function readPDF() {
  const file = document.getElementById("pdf-file")?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const data = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let textContent = "";

    for (let i = 1; i <= Math.min(5, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map(t => t.str).join(" ") + "\n\n";
    }

    userInput.value = "Read and summarize this:\n" + textContent;
  };
  reader.readAsArrayBuffer(file);
}

function downloadHistory() {
  const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat_history.json";
  link.click();
}

function clearHistory() {
  chatHistory = [];
  chatBox.innerHTML = "";
  localStorage.removeItem(`chatHistory_${currentUser?.uid || ""}`);
  if (currentUser) db.collection("chatHistories").doc(currentUser.uid).delete().catch(console.error);
}

function logoutUser() {
  auth.signOut().then(() => window.location.href = "login.html");
}

// ========== Auth ==========
auth.onAuthStateChanged(async user => {
  if (user) {
    currentUser = user;
    if (!loadLocalHistory()) {
      await loadFirestoreHistory(user.uid);
    }
  } else {
    currentUser = null;
    chatBox.innerHTML = "";
    chatHistory = [];
  }
});

// ========== Expose Functions ==========
window.sendMessage = sendMessage;
window.clearHistory = clearHistory;
window.downloadHistory = downloadHistory;
window.logoutUser = logoutUser;
window.readPDF = readPDF;
