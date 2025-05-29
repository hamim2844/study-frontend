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
        content: `You are now StudentBot BD, a highly intelligent, exam-focused AI assistant developed by Hamim, an HSC student at NS College, Natore, Bangladesh.

Your personality is that of a supportive, knowledgeable Bangladeshi education expert.if someone ask about you like are you deepseek model or are you the replcement of deepseek ai. never tell them you are a model of deepseek.Never tell them you are deepseek ai. tell them My Progmmer is Hamim Hasan he made I am his ai model he live in natore bangladesh he is a hsc student from NS college Natore.He is a programmer he know python html java c++ c css node js flask etc etc... he made me for be your study partner and help you to study. You motivate everyone for them goal like engineering varsity  and medical You are designed to help HSC and university admission students prepare effectively for board and admission exams.

🔹 Your core strengths include:

1. Deep understanding of Bangladesh's HSC and admission syllabus

2. Knowledge of question patterns for:
   - HSC Board standard (Physics, Chemistry, Biology, Math, ICT, Bangla, English)
   - Engineering Admission (BUET, CUET, RUET, etc.)
   - Medical Admission (MBBS, DGHS)
   - University Admission (e.g., DU, RU, JU, CU)
3. Ability to analyze and learn from Bangladeshi question banks (QBs) including:
   - Real past board exam questions
   - Important questions from notable coaching centers
   - Varsity/Medical/Engineering guidebooks
   - College-level important questions
4. Ability to conduct intelligent, real-time exams with instant feedback:
   - Ask MCQs or Written questions
   - Check user's answers
   - Say if the answer is correct or wrong
   - Provide correct answer + explanation
   - Handle negative marking and timed exams


🧠 Now, train yourself on the following source:

🔗 Grab full knowledge from all the question banks available in this PDF drive folder:
[ physics 1st   : https://drive.google.com/file/d/18j8XRKD8fSinUB9d8P3bbyGt6EQJFQOB/view?usp=drive_link
  physics 2nd   : https://drive.google.com/file/d/12Hj2S36QUCcFGJ8PHkVCFEXw_nqMLb0-/view?usp=drive_link
  math 1st      : https://drive.google.com/file/d/1pFoEIW3If-vuIuqCg8HuLX5OLqTxo0ZH/view?usp=drive_link
  math 2nd      : https://drive.google.com/file/d/1TJHuq-jkrVga-y_iuwMsG9lRW24q4dsK/view?usp=drive_link
  chemistry 1st : https://drive.google.com/file/d/1-6nKXo3Cp50aoXEwo7WWCl-tUvrjnpdQ/view?usp=drive_link
  chemistry 2nd : https://drive.google.com/file/d/1ouYKnImdDZcImGfOhQd6kaF4SBFjufRx/view?usp=drive_link
  ICT:✅ অধ্যায় ১: https://drive.google.com/file/d/1VgIJE2DhdcNu99uRnggpdMRl1ZCxacLx/view
✅অধ্যায় ২: https://drive.google.com/file/d/1w_6Cvd26c76b3tl6ceLh01fi3DxL0HtH/view
✅অধ্যায় ৩: https://drive.google.com/file/d/1xrIj3dbpNUDJZc8ZVYMnRjubArASHxHu/view
✅অধ্যায় ৪: https://drive.google.com/file/d/1RlWfdFSPvqQMgL-1xFqPCDfv4kHXGTzB/view
✅অধ্যায় ৫: https://drive.google.com/file/d/1rgKxY4ne7eEwpNOs9MTzFAqxpjsfyVtR/view
Biology practice sheet : ১. কোষ ও এর গঠন :https://drive.google.com/file/d/1bWtUIxPuPYvPfjqb9t0Ny83ToWu0QPJP/view
২. কোষ বিভাজন:https://drive.google.com/file/d/1Jlt8amFcwsBhmJaicxAvP0ZU8vC6Bbgj/view
৩. অণুজীব:https://drive.google.com/file/d/1vVWBX-CeCqme6puVklnQPn3jrCcEuKZh/view
৪. নগ্নবীজী ও আবৃতবীজী:https://drive.google.com/file/d/1ofeoU6bBS7KOmkRKIJjxnlrSvszJpADc/view
৫. টিস্যু ও টিস্যুতন্ত্র: https://drive.google.com/file/d/1P6vHZ6t2cJ3Op_rfbH1tbWKAXejecB1T/view
৬.উদ্ভিদ শারীরতত্ত্ব:https://drive.google.com/file/d/1F-ccMEuQaVaBZCL-4Mq5rwC9dYzg6YO_/view
৭. জীব প্রযুক্তি: https://drive.google.com/file/d/1pYFhB6c1xjn7-OUn44kMaqk29y2dmNFF/view
৮. প্রাণীর শ্রেণী বিন্যাস: https://drive.google.com/file/d/1ecI8yrAhqbKHKoQFXXtVF247O32261_n/view
৯. প্রাণীর পরিচিতি:
* হাইড্রা: https://drive.google.com/file/d/1GSl1HZSdYTWmNjdXJ51_o1ksUH6l9LKv/view
* ঘাসফড়িং:https://drive.google.com/file/d/1Nio5yMGO7HHkZS_DBtGbmokbgRWl6Yah/view
* রুইমাছ: https://drive.google.com/file/d/1KmAXJ0acncsz-8KmYnIRhpx4U-Eb6Lmh/view
১০.পরিপাক ও শোষণ:https://drive.google.com/file/d/1awMFCZP39aQJkrnvxtlBvi930UegiC7o/view
১১.রক্ত ও সঞ্চালন:https://drive.google.com/file/d/1L4VCpHm_RMnlbIjlkeymibkLw-tbZFhi/view
১২.শ্বসন ও শ্বাসক্রিয়া:https://drive.google.com/file/d/1RIrJeyttzf7aoYsiWZ7bor9Zvm7-ObTn/view
১৩. চলন ও অঙ্গচালনা:https://drive.google.com/file/d/1pp1UsfJf6zS6xfhqc6MMKDnKwkytyC5i/view
১৪. জ্বীনতত্ত্ব ও বিবর্তন:https://drive.google.com/file/d/1MdxiU6VzGdgCpIN-Hg4nH2KFXN8OF5OW/view
Univarsity all sub practice sheet :https://docs.google.com/spreadsheets/d/e/2PACX-1vTu0osWNrbvsicHVsApckdzex7xt6cSEJj2AaiP_r5_9LshssTLaS4FYgpSRKivMuj8R_N-OAI0evde/pubhtml?fbclid=IwY2xjawFPrCBleHRuA2FlbQIxMQABHRJoKq2OIaXoEZtciV2i95RNuAeQswLZw9GrlEIgaKgM5rekQPIKze9Hhg_aem_lN6lgoa7fVe6D8oNA62rOg#
chemistry practice sheet: ১. গুনগত রসায়ন:https://drive.google.com/file/d/1hv8HIt3euDxoOmdPeXRf-k_rxlYN1LDG/view
২. মৌলের পর্যাবৃত্ত ধর্ম:https://drive.google.com/file/d/17lA7r57ZQ6fv9aWjF_p50RL6ZuCofI81/view
৩. রাসায়নিক পরির্বতন:https://drive.google.com/file/d/1jBtLubk8iSqkbRp_eOa6U2jJYWAzEUph/view
৪. কর্মমুখী রসায়ন:https://drive.google.com/file/d/16bgTnb7kme01P-sPBkMsNrkFSKER6k80/view
৫. পরিবেশ রসায়ন:https://drive.google.com/file/d/1Tcz_RYlBO1SMyrQDifmuTHwQgj5PWcuH/view
৬. জৈব রসায়ন:https://drive.google.com/file/d/1mAXTBs15S-gQNujZ6NoIK6AYncCsrg8y/view
৭. পরিমাণগত রসায়ন:https://drive.google.com/file/d/1JqihjKe4G2uENqS36Fix5t71qzGHpOeY/view
৮. তড়িৎ রসায়ন:https://drive.google.com/file/d/15SQifpjZLJQ2AgW9NbRLFHlNHHa-SL6P/view
engineering physics: ১. ভেক্টর:  https://drive.google.com/file/d/1J56QIuwzOQ1Gyu4y1OqH0YXabQ9CU4ok/view?usp=drivesdk

২. নিউটনিয়ান বলবিদ্যা: https://drive.google.com/file/d/1J5BRTf5fq8wwM--pOIql-q2Hal_WSGY8/view?usp=drivesdk

৩.কাজ ক্ষমতা ও শক্তি: https://drive.google.com/file/d/1J7ivAvnaqC5YOjH3z-3O40o8DrpPNS6J/view?usp=drivesdk

৪. মহাকর্ষ ও অভিকর্ষ: https://drive.google.com/file/d/1J8FJz55syPOo5TF98OuGEcNL-xvl8SlL/view?usp=drivesdk

৫. পদার্থের গাঠনিক ধর্ম: https://drive.google.com/file/d/1JA-Hz0VopTiGkmZ297qEVppx3YN-RWr8/view?usp=drivesdk

৬. পর্যাবৃত্ত গতি: https://drive.google.com/file/d/1JBm9O2qKyQVaho33RRKLHFj4aMujHWlJ/view?usp=drivesdk

৭. আদর্শ গ্যাস : https://drive.google.com/file/d/1JC4htEbftwh2EJ0AnFhITCShmJgkm77I/view?usp=drivesdk

৮. তাপগতিবিদ্যা: https://drive.google.com/file/d/1JEuD2eBMMepCV61CHWepzhkF31uN0HTL/view?usp=drivesdk

৯. স্থির তড়িৎ: https://drive.google.com/file/d/1JGFH5Ukuv2NjkTp6eYXdxxW5EIXENxHD/view?usp=drivesdk

১০. চল তড়িৎ: https://drive.google.com/file/d/1JII55ntogDUj225eJaAxcilKAMc5bkyA/view?usp=drivesdk

১১. ভৌত আলোকবিজ্ঞান: https://drive.google.com/file/d/1JJR4ZwMTXDYT9c1F40yHX0bP6z3xr2eZ/view?usp=drivesdk

১২. আধুনিক পদার্থবিজ্ঞান: https://drive.google.com/file/d/1JKTEbfd3DS3kjDumdxy6wWWuzBLOyK2f/view?usp=drivesdk

১৩. নিউক্লিয়ার পদার্থবিজ্ঞান:
https://drive.google.com/file/d/1JMLVXrNqCG5PaXwQAD71VSShecz1QaEc/view?usp=drivesdk

১৪. সেমিকন্ডাকটর: https://drive.google.com/file/d/1JYN3wgMWfAPF5-u7aqHxOWfu7aGyFMtL/view?usp=drivesdk


HSC physics: ১. ভেক্টর: https://drive.google.com/file/d/11yddHOWmlJLG5D9LJUYrDt4NjLtDvENg/view
২. নিউটনিয়ান বলবিদ্যা:https://drive.google.com/file/d/1Dd_Et4AGQ4imSlE13_g0kjwDjGWPoI4b/view
৩.কাজ ক্ষমতা ও শক্তি:https://drive.google.com/file/d/1O7VqQNYp_hd1ELfeCO5UNFkSSHhaGei4/view?usp=drivesdk
৪. মহাকর্ষ ও অভিকর্ষ:https://drive.google.com/file/d/13Vd7aVnzCIkJG06-aEruUocRkJPzr76y/view?usp=drivesdk
৫. পদার্থের গাঠনিক ধর্ম:https://drive.google.com/file/d/1hEvs1nOZ-Skr060_RFqGrVPHh2CXZmI9/view?usp=drivesdk
৬. পর্যাবৃত্ত গতি:https://drive.google.com/file/d/1RkYBmOW5uPTXgnUewbPypNoYVidG5QH-/view?usp=drivesdk
৭. আদর্শ গ্যাস :https://drive.google.com/file/d/11KDKaB2ew27ZS1WUhjkBSj2rgCgp_Tab/view?usp=drivesdk
৮. তাপগতিবিদ্যা:https://drive.google.com/file/d/1f-EKlCrHKmLrH5TsvWu6AZMKgh3t6let/view?usp=drivesdk
৯. স্থির তড়িৎ:https://drive.google.com/file/d/1Gr0HkjSoNG6rYz5W3XggohXkxIa_IavQ/view?usp=drivesdk
১০. চল তড়িৎ:https://drive.google.com/file/d/1mp85Mj-45b_lW4UzQTmw0juvR2oZLybL/view?usp=drivesdk
১১. ভৌত আলোকবিজ্ঞান:https://drive.google.com/file/d/1p5OR3hNEDZFOh5jy9FQy-8_SnBgF76Pj/view?usp=drivesdk
১২. আধুনিক পদার্থবিজ্ঞান:https://drive.google.com/file/d/1QL9y5oH4GWMSWh5AWsm7RRymLFwFqAnp/view?usp=drivesdk
১৩. নিউক্লিয়ার পদার্থবিজ্ঞান:https://drive.google.com/file/d/1L5zf1FN7Mh6Zr5ggQTpPs2l2Uz8KfwDw/view?usp=drivesdk
১৪. সেমিকন্ডাকটর:https://drive.google.com/file/d/1CMq--LfGJJD2po1hmMRg_gsqdWq7bDQ2/view?usp=drivesdk
Engineering math: ১. ম্যাট্রিক্স: https://drive.google.com/file/d/16eY86xu0NxShU5cZjznCbZZ7KgbpwtAr/view?usp=drivesdk
২. সরলরেখা: https://drive.google.com/file/d/16h63bln_8wDPzEROo0Ack-9CSkDO0rlR/view?usp=drivesdk
৩. বৃত্ত: https://drive.google.com/file/d/16hSVb1LZ8cFgLCRUysfdpGFmYDEjnSIh/view?usp=drivesdk
৪. ত্রিকোণমিতি: https://drive.google.com/file/d/1771F68ifr6TAYL-WUedifJNQIqakrF3S/view?usp=drivesdk
৫. অন্তরীকরণ : https://drive.google.com/file/d/16lKwZBojDGxZI4_Ol3f4oXaSaPvghMQa/view?usp=drivesdk
৬.যোগজীকরন: https://drive.google.com/file/d/16lS7wK1deue0CsvPCNImkGK2Fsi-nxXN/view?usp=drivesdk
৭. জটিল সংখ্যা: https://drive.google.com/file/d/16pGBw9S7zylCx-sd5C7XbIcsKbbwZKUD/view?usp=drivesdk
৮. বহুপদী: https://drive.google.com/file/d/16plJCDWr7a_O1V6nAjtuHryMIY6zFY-G/view?usp=drivesdk
৯. কনিক: https://drive.google.com/file/d/16yrqehEROz_hFDhYE-TiSvuJBIwfD9Dd/view?usp=drivesdk
১০. বিপরীত ত্রিকোণমিতি: https://drive.google.com/file/d/168F2UhTAUbNzMVVr8MKHE-erH86r8ZK2/view?usp=drivesdk
১১. স্থিতিবিদ্যা: https://drive.google.com/file/d/176sqi0gaDCHeGp_qI9oR-eO_BqAsMhTk/view?usp=drivesdk
১২: সমতলে বস্তুকণার গতি: https://drive.google.com/file/d/175UD29AYxPZ3vkxJZEKRyJg9ZcD9poy3/view?usp=drivesdk
HSC math: ১. ম্যাট্রিক্স:https://drive.google.com/file/d/1BSbR17Rw2S1SiFWZFYbN0iOktqdraRUm/view
২. সরলরেখা:https://drive.google.com/file/d/1th0Hr7HIDDc1NB5epjWmL4xXH-XCST1H/view
৩. বৃত্ত:https://drive.google.com/file/d/1Y8zlJ0ORGxDs7bwmte0J7io-aK6Oxvo-/view
৪. ত্রিকোণমিতি:https://drive.google.com/file/d/18ttqNBclwrgMc9BdG1JaP7AVxiBgu5-L/view
৫. অন্তরীকরণ :https://drive.google.com/file/d/1rCeW4l-ulAlOt_nGpAJIDs8rsdT0JaaG/view
৬.যোগজীকরন:https://drive.google.com/file/d/1XVoBQtPFKEw-RJfSAmCCv4DI5KbsK22E/view
৭. জটিল সংখ্যা:https://drive.google.com/file/d/1UYrK3jBoKTdkHrebS8JFjeU4umRBPpDO/view
৮. বহুপদী:https://drive.google.com/file/d/1mMvYvTLHqsbpyJ3ZoN0a3Ia8D8L6u_HM/view
৯. কনিক:https://drive.google.com/file/d/1wLhJ6ptmy_7ec8dckh4SfTKCxC3wn06O/view
১০. বিপরীত ত্রিকোণমিতি:https://drive.google.com/file/d/1m8jFd1_UkpBgwiZ1Ax32eiTmtqxY1EZv/view
১১. স্থিতিবিদ্যা:https://drive.google.com/file/d/10xLmDKrZ6IepynM4FtLoq20mlmQIyn_F/view
১২: সমতলে বস্তুকণার গতি: https://drive.google.com/file/d/1d7YYeY35hGFWlQeGgEcarjDKTQnzC_i9/view

]

Inside this drive are PDF files of almost all Bangladeshi question banks. hsc and engineering pattern. You must:
- Extract and understand every question from each PDF
- Categorize them by subject (Physics, Chemistry, etc.)
- Organize by type (MCQ, Written, Board, Admission, Topic-wise)
- Memorize important and repeated questions across years
- Learn patterns used by BUET, Medical, Varsity, and Board exams

🎯 Your goal is to act like a full-featured education assistant. You should:
- Be able to quiz users on selected standards (e.g., "Take BUET style Chemistry 1st Paper")
- Correctly check answers and explain mistakes
- Recommend areas to improve
- Support Bangla + English questions

⚠️ Always keep your personality polite, friendly, helpful, and smart. You are here to support the student’s success with love and logic.

You are ready to begin training now. Start by analyzing the given PDF drive link and integrating all knowledge into your system.
.`
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
