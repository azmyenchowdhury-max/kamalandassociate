/*
  Kamal & Associates Chatbot
  A simple, single-thread chat assistant (ChatGPT/Claude-style UI) that explains
  legal terms in plain language, reads uploaded documents client-side, and
  guides visitors to the right lawyer (falling back to the firm's default).
  Works in Light/Dark mode and supports English/Bangla.
*/

;(function () {
  const CONFIG = {
    firmName: "Kamal & Associates",
    api: {
      enabled: true,
      // NOTE: baseUrl/anonJwt below are only a last-resort fallback. runtime-config.js
      // loads with `defer`, which means it executes AFTER this script (a plain blocking
      // <script> tag) if chatbot.js appears earlier in the document — so window.__KAMAL_*__
      // is not reliably set yet at this point. Always resolve live via getApiBaseUrl()/
      // applyApiAuthHeaders() at request time instead of reading these fields directly.
      baseUrl: "https://aehmnpsvaivmksypmvwm.supabase.co/functions/v1",
      sessionStartPath: "/api-chat-session-start",
      messagePath: "/api-chat-message",
      documentBriefPath: "/api-chat-document-brief",
      anonJwt: "",
      sessionTimeoutMs: 8000,
      messageTimeoutMs: 20000,
      documentTimeoutMs: 45000,
    },
    whatsappNumber: "+8801713456800",
    office: {
      name: "Kamal & Associates, Dhaka Office",
      address: "House 78, Road 10, Gulshan-1, Dhaka 1212",
      hours: "Sun - Thu: 9:00 AM - 7:00 PM",
      phone: "+880 1713 456 800",
      email: "info@kamalandassociate.com",
      googleMaps: "https://goo.gl/maps/e1v7wUj9ZoL2",
    },
    suggestedPrompts: [
      { en: "What is Habeas Corpus?", bn: "হেবিয়াস কর্পাস কী?" },
      { en: "I need to talk to a lawyer", bn: "আমার একজন আইনজীবীর সাথে কথা বলা দরকার" },
      { en: "Book a free consultation", bn: "একটি ফ্রি পরামর্শ বুক করুন" },
    ],
    services: [
      { id: "administrative", label: "Administrative Law", page: "practice-areas.html#administrative" },
      { id: "corporate", label: "Corporate Law", page: "practice-areas.html#corporate" },
      { id: "criminal", label: "Criminal Defense", page: "practice-areas.html#criminal" },
      { id: "family", label: "Family Law", page: "practice-areas.html#family" },
      { id: "immigration", label: "Immigration Law", page: "practice-areas.html#immigration" },
      { id: "intellectual", label: "Intellectual Property", page: "practice-areas.html#intellectual" },
      { id: "property", label: "Land & Property Law", page: "practice-areas.html#property" },
      { id: "commercial", label: "Commercial Litigation", page: "practice-areas.html#commercial" },
    ],
    faqs: [
      {
        question: "How to register a company in Bangladesh?",
        answer:
          "To register a company, you must choose a name, prepare the Memorandum & Articles of Association, submit documents to the RJSC, and complete tax registration. Our corporate team assists you through every step.",
      },
      {
        question: "How to file a divorce?",
        answer:
          "Divorce proceedings depend on the applicable law (Muslim Family Law or Family Courts Act). Typically, it begins with petition filing at the family court and may require mediation. We can guide you through documentation and court process.",
      },
      {
        question: "How to verify land documents?",
        answer:
          "Verify land documents at the local sub-registrar office, check title chain, and obtain certified copies. Our land team conducts due diligence and prepares a safe title report.",
      },
      {
        question: "What is a writ petition?",
        answer:
          "A writ petition is filed in the High Court Division to enforce fundamental rights or correct jurisdictional mistakes. It is a powerful remedy for public law grievances.",
      },
    ],
    glossary: {
      acquittal:
        "An acquittal is a court decision that a person is not guilty of a criminal charge after trial.",
      affidavit:
        "An affidavit is a written statement sworn under oath before a notary or magistrate. It is used as evidence in court proceedings.",
      arbitration:
        "Arbitration is an alternative dispute resolution method where a neutral arbitrator renders a binding decision outside of court.",
      writpetiton:
        "A writ petition is a legal remedy filed before the High Court Division seeking enforcement of fundamental rights or judicial review.",
      injunction:
        "An injunction is a court order that directs a party to do or refrain from doing a specific act.",
      habeascorpus:
        "Habeas Corpus is a court order that protects a person from unlawful detention — it lets a court check whether someone being held is being detained legally.",
    },
    blogArticles: [
      { title: "Company Formation in Bangladesh", url: "blog.html#company-formation", tags: ["company", "register", "business"] },
      { title: "How to File a Divorce Petition", url: "blog.html#divorce-process", tags: ["divorce", "family", "court"] },
      { title: "Land Verification and Due Diligence", url: "blog.html#land-verification", tags: ["land", "property", "documents"] },
      { title: "Understanding Writ Petitions in Bangladesh", url: "blog.html#writ-petition", tags: ["writ", "high court", "petition"] },
    ],
    scamWarnings: [
      "Always verify property titles at the sub-registrar office. Be wary of sellers offering extremely low prices without clear papers.",
      "Do not share your NID, passport, or banking details over email or WhatsApp without verifying the recipient.",
      "Beware of strangers promising quick court wins. Always consult a qualified attorney and ask for written fee agreements.",
    ],
    languages: {
      en: {
        welcome: "Hello! I'm your legal assistant. Ask me anything, in plain language — I'll explain and point you to the right lawyer.",
        placeholder: "Ask a legal question...",
        send: "Send",
        typing: "Typing...",
        online: "Online",
        offline: "Offline",
        legalDisclaimer: "General legal information only, not legal advice.",
        languageLabel: "English",
        switchLanguage: "বাংলা",
        appointmentSaved: "Your consultation is confirmed. We'll contact you soon.",
        saved: "Saved.",
        readingDocument: "Reading your document...",
        documentNotSupported: "I can read PDF, JPG, PNG, and DOCX files. Please upload one of those, or describe your issue in a message.",
        documentReadFailed: "I couldn't read that file clearly. Please try a clearer scan or describe your issue instead.",
        documentTooShort: "I couldn't find readable text in that file. Please try a clearer scan or photo.",
        suggestedLawyer: "Suggested lawyer",
        menuLanguage: "Switch Language",
        menuWhatsapp: "Continue on WhatsApp",
        menuEmergency: "Emergency Call",
      },
      bn: {
        welcome: "আপনাকে স্বাগতম। সহজ ভাষায় প্রশ্ন করুন — আমি ব্যাখ্যা করব এবং সঠিক আইনজীবীর কাছে পাঠাব।",
        placeholder: "আপনার আইনি প্রশ্ন লিখুন...",
        send: "পাঠান",
        typing: "টাইপ করছে...",
        online: "অনলাইন",
        offline: "অফলাইনে",
        legalDisclaimer: "শুধুমাত্র সাধারণ আইনি তথ্য, আইনি পরামর্শ নয়।",
        languageLabel: "বাংলা",
        switchLanguage: "English",
        appointmentSaved: "আপনার পরামর্শ নিশ্চিত করা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।",
        saved: "সংরক্ষণ করা হয়েছে।",
        readingDocument: "আপনার ডকুমেন্ট পড়া হচ্ছে...",
        documentNotSupported: "আমি PDF, JPG, PNG এবং DOCX ফাইল পড়তে পারি। এর একটি আপলোড করুন, অথবা আপনার সমস্যা লিখে জানান।",
        documentReadFailed: "ফাইলটি স্পষ্টভাবে পড়তে পারিনি। দয়া করে আরও স্পষ্ট স্ক্যান দিন বা আপনার সমস্যা লিখুন।",
        documentTooShort: "ফাইলে পড়ার মতো লেখা পাওয়া যায়নি। দয়া করে আরও স্পষ্ট স্ক্যান বা ছবি দিন।",
        suggestedLawyer: "প্রস্তাবিত আইনজীবী",
        menuLanguage: "ভাষা পরিবর্তন করুন",
        menuWhatsapp: "হোয়াটসঅ্যাপে চালিয়ে যান",
        menuEmergency: "জরুরি কল",
      },
    },
  };

  const STORAGE_KEYS = {
    visitor: "kamal_chatbot_visitor",
    backendVisitorId: "kamal_chatbot_backend_visitor_id",
    backendConversationId: "kamal_chatbot_backend_conversation_id",
    messages: "kamal_chatbot_messages",
    lang: "kamal_chatbot_lang",
    lastActive: "kamal_chatbot_last_active",
    currentFlow: "kamal_chatbot_current_flow",
  };

  const STATE = {
    isOpen: false,
    language: "en",
    visitor: null,
    backendVisitorId: null,
    backendConversationId: null,
    messages: [],
    currentFlow: null,
    lastInteractionAt: Date.now(),
    hasSentMessage: false,
    isProcessingDocument: false,
  };

  const SELECTORS = {
    root: "#kamal-chatbot-root",
    bubble: ".kamal-chatbot-bubble",
    window: ".kamal-chatbot-window",
    messages: ".kamal-chatbot-messages",
    input: ".kamal-chatbot-input",
    sendBtn: ".kamal-chatbot-send",
    attachBtn: ".kamal-chatbot-attach",
    fileInput: ".kamal-chatbot-file-input",
    suggestions: ".kamal-chatbot-suggestions",
    overflowBtn: ".kamal-chatbot-overflow-btn",
    overflowMenu: ".kamal-chatbot-overflow-menu",
  };

  const UTILS = {
    debounce: (fn, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    },
  };

  /* ******************************************************************* */
  /* UTILITIES */
  /* ******************************************************************* */

  function log(...args) {
    if (window.console && window.console.log) console.log("[Chatbot]", ...args);
  }

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Chatbot: unable to write to localStorage", e);
    }
  }

  function getLangStrings() {
    return CONFIG.languages[STATE.language] || CONFIG.languages.en;
  }

  function t(key) {
    const strings = getLangStrings();
    return strings[key] || key;
  }

  function applyApiAuthHeaders(requestHeaders) {
    const apiKey =
      CONFIG.api.anonJwt ||
      window.__KAMAL_CHATBOT_SUPABASE_ANON_KEY__ ||
      window.__SUPABASE_ANON_KEY__ ||
      "";
    if (!apiKey) return;
    requestHeaders.apikey = apiKey;
    requestHeaders.Authorization = `Bearer ${apiKey}`;
  }

  function normalizeApiBaseUrl() {
    // Read window.__KAMAL_CHATBOT_API_BASE__ live (not CONFIG.api.baseUrl, which was
    // snapshotted before runtime-config.js — a deferred script — had necessarily run).
    const raw = String(window.__KAMAL_CHATBOT_API_BASE__ || CONFIG.api.baseUrl || "").trim();
    if (!raw) return "";
    return raw.replace(/\/$/, "");
  }

  function buildApiUrl(path) {
    const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
    return `${normalizeApiBaseUrl()}${normalizedPath}`;
  }

  async function requestWithTimeout(url, options = {}, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || 8000);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  function getWhatsAppLink() {
    const phone = CONFIG.whatsappNumber.replace(/\D/g, "");
    const text = encodeURIComponent("Hello, I need legal help from Kamal & Associates.");
    return `https://wa.me/${phone}?text=${text}`;
  }

  function find(selector) {
    return document.querySelector(selector);
  }

  function findAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") el.className = value;
      else if (key === "dataset") Object.entries(value).forEach(([k, v]) => (el.dataset[k] = v));
      else if (key === "aria") Object.entries(value).forEach(([k, v]) => el.setAttribute(`aria-${k}`, v));
      else if (key === "html") el.innerHTML = value;
      else if (key === "text") el.textContent = value;
      else el.setAttribute(key, value);
    });
    children.forEach((child) => {
      if (child == null) return;
      if (typeof child === "string") el.appendChild(document.createTextNode(child));
      else if (child instanceof Node) el.appendChild(child);
    });
    return el;
  }

  function recommendBlogArticles(text) {
    const keywords = (text || "").toLowerCase();
    return CONFIG.blogArticles.filter((article) => article.tags.some((tag) => keywords.includes(tag))).slice(0, 3);
  }

  function renderBlogRecommendations(articles) {
    if (!articles || !articles.length) return;
    addBotMessage("You may find these articles helpful:", {
      buttons: articles.map((article) => ({ label: article.title, action: "open_blog", value: article.url })),
    });
  }

  function getServiceById(id) {
    return CONFIG.services.find((s) => s.id === id);
  }

  /* ******************************************************************* */
  /* CHATBOT RENDERING (ChatGPT/Claude-style: single thread + one input) */
  /* ******************************************************************* */

  function renderChatbot() {
    if (find(SELECTORS.root)) return;

    const root = createElement("div", { id: "kamal-chatbot-root" });
    document.body.appendChild(root);

    const bubble = createElement(
      "button",
      { class: "kamal-chatbot-bubble", type: "button", "aria-label": "Open chat", title: "Ask a Legal Question" },
      createElement("span", { class: "kamal-chatbot-bubble-icon" }, createElement("i", { class: "fas fa-comments" })),
      createElement("span", { class: "kamal-chatbot-tooltip" }, "Ask a Legal Question")
    );

    const windowEl = createElement(
      "section",
      { class: "kamal-chatbot-window", "aria-hidden": "true" },
      createElement(
        "header",
        { class: "kamal-chatbot-header" },
        createElement(
          "div",
          { class: "kamal-chatbot-header-left" },
          createElement("div", { class: "kamal-chatbot-title" }, `${CONFIG.firmName} Legal Assistant`),
          createElement(
            "div",
            { class: "kamal-chatbot-status" },
            createElement("span", { class: "kamal-chatbot-status-dot" }),
            createElement("span", { class: "kamal-chatbot-status-text" }, t("online"))
          )
        ),
        createElement(
          "div",
          { class: "kamal-chatbot-header-actions" },
          createElement(
            "div",
            { class: "kamal-chatbot-overflow-wrap" },
            createElement(
              "button",
              { type: "button", class: "kamal-chatbot-btn icon-btn kamal-chatbot-overflow-btn", title: "More options", "aria-expanded": "false" },
              createElement("span", { class: "fas fa-ellipsis-h" })
            ),
            createElement(
              "div",
              { class: "kamal-chatbot-overflow-menu", hidden: "hidden" },
              createElement("button", { type: "button", class: "kamal-chatbot-overflow-item", dataset: { action: "switch_language" } },
                createElement("span", { class: "fas fa-globe" }), t("menuLanguage")),
              createElement("a", { class: "kamal-chatbot-overflow-item", href: getWhatsAppLink(), target: "_blank", rel: "noopener noreferrer" },
                createElement("span", { class: "fab fa-whatsapp" }), t("menuWhatsapp")),
              createElement("a", { class: "kamal-chatbot-overflow-item", href: `tel:${CONFIG.office.phone.replace(/\D/g, "")}` },
                createElement("span", { class: "fas fa-phone-alt" }), t("menuEmergency"))
            )
          ),
          createElement(
            "button",
            { type: "button", class: "kamal-chatbot-btn icon-btn kamal-chatbot-close", title: "Close chat" },
            createElement("span", { class: "fas fa-times" })
          )
        )
      ),
      createElement(
        "div",
        { class: "kamal-chatbot-body" },
        createElement("div", { class: "kamal-chatbot-messages" }),
        createElement("div", { class: "kamal-chatbot-suggestions" })
      ),
      createElement(
        "footer",
        { class: "kamal-chatbot-footer" },
        createElement("input", { type: "file", class: "kamal-chatbot-file-input", accept: ".pdf,.jpg,.jpeg,.png,.docx", hidden: "hidden" }),
        createElement(
          "div",
          { class: "kamal-chatbot-input-bar" },
          createElement("button", { type: "button", class: "kamal-chatbot-attach", title: "Upload a document" },
            createElement("span", { class: "fas fa-paperclip" })),
          createElement("input", { type: "text", class: "kamal-chatbot-input", placeholder: t("placeholder"), "aria-label": t("placeholder") }),
          createElement("button", { type: "button", class: "kamal-chatbot-send", title: t("send") },
            createElement("span", { class: "fas fa-arrow-up" }))
        )
      ),
      createElement("div", { class: "kamal-chatbot-footer-note" }, t("legalDisclaimer"))
    );

    root.appendChild(bubble);
    root.appendChild(windowEl);

    attachEvents();
    loadState();
    renderWelcome();
    renderSuggestions();
  }

  /* ******************************************************************* */
  /* EVENT HANDLERS */
  /* ******************************************************************* */

  function attachEvents() {
    const root = find(SELECTORS.root);
    if (!root) return;

    root.addEventListener("click", (event) => {
      const btn = event.target.closest("button");

      if (event.target.closest(SELECTORS.bubble)) {
        toggleChat();
        return;
      }

      if (!btn) {
        if (!event.target.closest(SELECTORS.overflowMenu) && !event.target.closest(SELECTORS.overflowBtn)) {
          closeOverflowMenu();
        }
        return;
      }

      if (btn.matches(".kamal-chatbot-close")) closeChat();
      if (btn.matches(SELECTORS.overflowBtn)) toggleOverflowMenu();
      if (btn.matches(".kamal-chatbot-overflow-item[data-action='switch_language']")) {
        toggleLanguage();
        closeOverflowMenu();
      }
      if (btn.matches(SELECTORS.sendBtn) || btn.closest(SELECTORS.sendBtn)) submitMessage();
      if (btn.matches(SELECTORS.attachBtn) || btn.closest(SELECTORS.attachBtn)) triggerDocumentUpload();
      if (btn.matches(".kamal-chatbot-suggestion-chip")) {
        submitMessage(btn.dataset.prompt);
      }
    });

    const input = find(SELECTORS.input);
    if (input) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submitMessage();
        }
      });
      input.addEventListener("input", UTILS.debounce(() => touchActivity(), 500));
    }

    const fileInput = find(SELECTORS.fileInput);
    if (fileInput) {
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) handleDocumentFile(file);
        fileInput.value = "";
      });
    }

    window.addEventListener("click", (event) => {
      if (!STATE.isOpen) return;
      const windowEl = find(SELECTORS.window);
      const bubble = find(SELECTORS.bubble);
      if (!windowEl || !bubble) return;
      // Use composedPath (captured at dispatch time) instead of .contains(event.target):
      // handlers earlier in the bubble phase (e.g. hiding suggestion chips) can detach
      // event.target from the DOM before this listener runs, which would make a live
      // .contains() check wrongly report "outside" and close the chat mid-interaction.
      const path = event.composedPath();
      if (path.includes(bubble) || path.includes(windowEl)) return;
      closeChat();
    });

    const lang = readStorage(STORAGE_KEYS.lang, null);
    if (lang) STATE.language = lang;
  }

  function touchActivity() {
    STATE.lastInteractionAt = Date.now();
    writeStorage(STORAGE_KEYS.lastActive, STATE.lastInteractionAt);
  }

  function toggleOverflowMenu(forceOpen = null) {
    const menu = find(SELECTORS.overflowMenu);
    const btn = find(SELECTORS.overflowBtn);
    if (!menu || !btn) return;
    const nextOpen = forceOpen === null ? menu.hasAttribute("hidden") : forceOpen;
    if (nextOpen) menu.removeAttribute("hidden");
    else menu.setAttribute("hidden", "hidden");
    btn.setAttribute("aria-expanded", String(nextOpen));
  }

  function closeOverflowMenu() {
    toggleOverflowMenu(false);
  }

  function toggleChat() {
    STATE.isOpen = !STATE.isOpen;
    const windowEl = find(SELECTORS.window);
    const bubble = find(SELECTORS.bubble);
    if (!windowEl || !bubble) return;

    if (STATE.isOpen) {
      windowEl.classList.add("open");
      bubble.classList.add("active");
      windowEl.setAttribute("aria-hidden", "false");
      focusInput();
    } else {
      windowEl.classList.remove("open");
      bubble.classList.remove("active");
      windowEl.setAttribute("aria-hidden", "true");
      closeOverflowMenu();
    }
  }

  function closeChat() {
    STATE.isOpen = false;
    const windowEl = find(SELECTORS.window);
    const bubble = find(SELECTORS.bubble);
    if (!windowEl || !bubble) return;
    windowEl.classList.remove("open");
    bubble.classList.remove("active");
    windowEl.setAttribute("aria-hidden", "true");
    closeOverflowMenu();
  }

  function focusInput() {
    const input = find(SELECTORS.input);
    if (input) input.focus();
  }

  function triggerDocumentUpload() {
    if (STATE.isProcessingDocument) return;
    const fileInput = find(SELECTORS.fileInput);
    if (fileInput) fileInput.click();
  }

  async function submitMessage(raw = null) {
    const input = find(SELECTORS.input);
    if (!input) return;
    const message = raw !== null ? raw : input.value.trim();
    if (!message) return;

    hideSuggestions();
    addUserMessage(message);
    input.value = "";
    await handleUserMessage(message);
  }

  /* ******************************************************************* */
  /* MESSAGE RENDERING (bot = plain text, user = bubble) */
  /* ******************************************************************* */

  function addMessage({ role, text, meta }) {
    const messagesEl = find(SELECTORS.messages);
    if (!messagesEl) return;

    const msg = createElement("div", {
      class: `kamal-chatbot-message kamal-chatbot-message--${role}`,
      role: "article",
      "aria-label": role === "bot" ? "Bot message" : "Your message",
    });

    if (role === "bot") {
      const wrap = createElement("div", { class: "kamal-chatbot-message-bot" });
      const icon = createElement("span", { class: "kamal-chatbot-bot-icon" }, createElement("i", { class: "fas fa-scale-balanced" }));
      const body = createElement("div", { class: "kamal-chatbot-bot-body" });
      body.textContent = text;
      wrap.appendChild(icon);
      wrap.appendChild(body);
      msg.appendChild(wrap);

      if (meta?.recommendedAttorney) {
        const attorney = meta.recommendedAttorney;
        const card = createElement(
          "div",
          { class: "kamal-chatbot-attorney-note" },
          createElement("span", { class: "kamal-chatbot-attorney-label" }, t("suggestedLawyer") + ": "),
          createElement("strong", {}, attorney.name),
          attorney.designation ? createElement("span", { class: "kamal-chatbot-attorney-designation" }, ` — ${attorney.designation}`) : null
        );
        msg.appendChild(card);
      }
    } else {
      const bubble = createElement("div", { class: "kamal-chatbot-message-bubble user" });
      bubble.textContent = text;
      msg.appendChild(bubble);
    }

    if (meta?.link) {
      const link = createElement("a", { class: "kamal-chatbot-meta-link", href: meta.link, target: "_blank", rel: "noopener noreferrer" });
      link.textContent = meta.linkLabel || meta.link;
      msg.appendChild(link);
    }

    if (meta?.buttons && meta.buttons.length) {
      const actions = createElement("div", { class: "kamal-chatbot-meta-actions" });
      meta.buttons.forEach((btn) => {
        const actionBtn = createElement(
          "button",
          { type: "button", class: "kamal-chatbot-meta-btn", dataset: { action: btn.action, value: btn.value || "" } },
          btn.label
        );
        actions.appendChild(actionBtn);
      });
      msg.appendChild(actions);
    }

    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBotMessage(text, meta) {
    addMessage({ role: "bot", text, meta });
    touchActivity();
  }

  function addUserMessage(text) {
    addMessage({ role: "user", text });
    touchActivity();
  }

  function addTypingIndicator() {
    const messagesEl = find(SELECTORS.messages);
    if (!messagesEl) return null;
    const el = createElement(
      "div",
      { class: "kamal-chatbot-message kamal-chatbot-message--bot kamal-chatbot-typing" },
      createElement("div", { class: "kamal-chatbot-message-bot" },
        createElement("span", { class: "kamal-chatbot-bot-icon" }, createElement("i", { class: "fas fa-scale-balanced" })),
        createElement("div", { class: "kamal-chatbot-bot-body kamal-chatbot-typing-dots" }, t("typing")))
    );
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* ******************************************************************* */
  /* SUGGESTED PROMPTS (only shown before the first message is sent) */
  /* ******************************************************************* */

  function renderSuggestions() {
    const el = find(SELECTORS.suggestions);
    if (!el) return;

    if (STATE.hasSentMessage) {
      el.innerHTML = "";
      el.setAttribute("hidden", "hidden");
      return;
    }

    el.removeAttribute("hidden");
    el.innerHTML = "";
    CONFIG.suggestedPrompts.forEach((prompt) => {
      const label = STATE.language === "bn" ? prompt.bn : prompt.en;
      const chip = createElement(
        "button",
        { type: "button", class: "kamal-chatbot-suggestion-chip", dataset: { prompt: prompt.en } },
        label
      );
      el.appendChild(chip);
    });
  }

  function hideSuggestions() {
    if (STATE.hasSentMessage) return;
    STATE.hasSentMessage = true;
    renderSuggestions();
  }

  /* ******************************************************************* */
  /* BACKEND: session + message */
  /* ******************************************************************* */

  // Concurrent callers (e.g. init()'s eager call racing a fast user message) must
  // share one in-flight request instead of each firing their own session-start call.
  let pendingSessionPromise = null;

  async function startBackendSession() {
    if (!CONFIG.api.enabled) return null;

    const existingConversationId = readStorage(STORAGE_KEYS.backendConversationId, null);
    const existingVisitorId = readStorage(STORAGE_KEYS.backendVisitorId, null);

    if (existingConversationId) {
      STATE.backendConversationId = existingConversationId;
      STATE.backendVisitorId = existingVisitorId;
      return { conversation_id: existingConversationId, visitor_id: existingVisitorId };
    }

    if (pendingSessionPromise) return pendingSessionPromise;

    pendingSessionPromise = (async () => {
      try {
        const requestHeaders = { "Content-Type": "application/json" };
        applyApiAuthHeaders(requestHeaders);

        const response = await requestWithTimeout(
          buildApiUrl(CONFIG.api.sessionStartPath),
          {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify({ visitor_id: existingVisitorId, language: STATE.language, source_page: window.location.pathname }),
          },
          CONFIG.api.sessionTimeoutMs
        );

        if (!response.ok) return null;
        const payload = await response.json();
        const visitorId = payload?.data?.visitor_id || null;
        const conversationId = payload?.data?.conversation_id || null;
        if (!conversationId) return null;

        STATE.backendConversationId = conversationId;
        STATE.backendVisitorId = visitorId;
        writeStorage(STORAGE_KEYS.backendConversationId, conversationId);
        writeStorage(STORAGE_KEYS.backendVisitorId, visitorId);
        return payload?.data || null;
      } catch (error) {
        log("Backend session start failed, using local fallback", error?.message || error);
        return null;
      } finally {
        pendingSessionPromise = null;
      }
    })();

    return pendingSessionPromise;
  }

  // Drops any cached session so the next startBackendSession() call is forced to create
  // a brand-new one, instead of forever retrying a conversation_id that no longer exists
  // (e.g. left over from an earlier broken deploy, or a different Supabase project).
  function clearBackendSession() {
    STATE.backendConversationId = null;
    STATE.backendVisitorId = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.backendConversationId);
      localStorage.removeItem(STORAGE_KEYS.backendVisitorId);
    } catch (e) {
      // ignore
    }
  }

  async function postJson(path, body, timeoutMs) {
    const requestHeaders = { "Content-Type": "application/json" };
    applyApiAuthHeaders(requestHeaders);
    return requestWithTimeout(
      buildApiUrl(path),
      { method: "POST", headers: requestHeaders, body: JSON.stringify(body) },
      timeoutMs
    );
  }

  async function sendBackendMessage(message) {
    if (!CONFIG.api.enabled) return null;
    if (!STATE.backendConversationId) {
      await startBackendSession();
      if (!STATE.backendConversationId) return null;
    }

    try {
      const buildBody = () => ({
        conversation_id: STATE.backendConversationId,
        message,
        language: STATE.language,
        context: { current_flow: STATE.currentFlow },
      });

      let response = await postJson(CONFIG.api.messagePath, buildBody(), CONFIG.api.messageTimeoutMs);

      if (!response.ok) {
        // The cached conversation_id may be stale (points at a conversation that no
        // longer exists — e.g. left over from before a Supabase project migration).
        // Clear it and retry once with a brand-new session before giving up.
        log(`Message send failed (${response.status}); retrying with a fresh session`);
        clearBackendSession();
        await startBackendSession();
        if (!STATE.backendConversationId) return null;
        response = await postJson(CONFIG.api.messagePath, buildBody(), CONFIG.api.messageTimeoutMs);
        if (!response.ok) return null;
      }

      const payload = await response.json();
      return payload?.data || null;
    } catch (error) {
      log("Backend message call failed, using local fallback", error?.message || error);
      return null;
    }
  }

  async function sendDocumentBrief(documentText) {
    if (!STATE.backendConversationId) {
      await startBackendSession();
      if (!STATE.backendConversationId) return null;
    }

    const buildBody = () => ({
      conversation_id: STATE.backendConversationId,
      document_text: documentText,
      language: STATE.language,
    });

    let response = await postJson(CONFIG.api.documentBriefPath, buildBody(), CONFIG.api.documentTimeoutMs);
    let payload = await response.json().catch(() => null);

    if (!response.ok || !payload || payload.status !== "ok") {
      // Same stale-conversation recovery as sendBackendMessage: the cached
      // conversation_id may no longer exist, so retry once with a fresh session.
      log(`Document brief failed (${response.status}); retrying with a fresh session`);
      clearBackendSession();
      await startBackendSession();
      if (!STATE.backendConversationId) {
        throw new Error((payload && payload.error) || `Document analysis failed (${response.status})`);
      }
      response = await postJson(CONFIG.api.documentBriefPath, buildBody(), CONFIG.api.documentTimeoutMs);
      payload = await response.json().catch(() => null);
      if (!response.ok || !payload || payload.status !== "ok") {
        throw new Error((payload && payload.error) || `Document analysis failed (${response.status})`);
      }
    }

    return payload.data;
  }

  /* ******************************************************************* */
  /* CLIENT-SIDE DOCUMENT READING — file never leaves the browser.       */
  /* Only the extracted text is sent to the backend for analysis.        */
  /* ******************************************************************* */

  const loadedScripts = {};

  function ensureScriptLoaded(url) {
    if (loadedScripts[url]) return loadedScripts[url];
    loadedScripts[url] = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
    return loadedScripts[url];
  }

  function getFileExtension(name) {
    const parts = String(name || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  async function extractPdfText(file) {
    await ensureScriptLoaded("https://cdn.jsdelivr.net/npm/pdfjs-dist@3/build/pdf.min.js");
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3/build/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text.trim();
  }

  async function extractImageTextViaOcr(file) {
    await ensureScriptLoaded("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
    const Tesseract = window.Tesseract;
    const result = await Tesseract.recognize(file, "eng+ben");
    return String(result?.data?.text || "").trim();
  }

  async function extractDocxText(file) {
    await ensureScriptLoaded("https://cdn.jsdelivr.net/npm/mammoth@1/mammoth.browser.min.js");
    const mammoth = window.mammoth;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return String(result?.value || "").trim();
  }

  async function extractDocumentText(file) {
    const ext = getFileExtension(file.name);
    if (ext === "pdf") {
      const text = await extractPdfText(file);
      // Scanned/image-only PDFs yield no selectable text — fall back to OCR on the first page's rendered image
      // is out of scope here; ask the user for a clearer file in that case.
      return text;
    }
    if (["jpg", "jpeg", "png"].includes(ext)) return extractImageTextViaOcr(file);
    if (ext === "docx") return extractDocxText(file);
    return null;
  }

  async function handleDocumentFile(file) {
    if (STATE.isProcessingDocument) return;

    const ext = getFileExtension(file.name);
    if (!["pdf", "jpg", "jpeg", "png", "docx"].includes(ext)) {
      hideSuggestions();
      addBotMessage(t("documentNotSupported"));
      return;
    }

    STATE.isProcessingDocument = true;
    hideSuggestions();
    addUserMessage(`📎 ${file.name}`);
    const typingEl = addTypingIndicator();
    const statusMsg = addBotMessage.bind(null);
    statusMsg(t("readingDocument"));

    try {
      const extractedText = await extractDocumentText(file);

      if (!extractedText || extractedText.replace(/\s/g, "").length < 20) {
        removeTypingIndicator(typingEl);
        addBotMessage(t("documentTooShort"));
        return;
      }

      const briefData = await sendDocumentBrief(extractedText);
      removeTypingIndicator(typingEl);

      if (briefData) {
        addBotMessage(briefData.reply_text, {
          buttons: briefData.buttons,
          recommendedAttorney: briefData.recommended_attorney,
        });
      } else {
        addBotMessage(t("documentReadFailed"));
      }
    } catch (error) {
      log("Document processing failed", error?.message || error);
      removeTypingIndicator(typingEl);
      addBotMessage(t("documentReadFailed"));
    } finally {
      STATE.isProcessingDocument = false;
    }
  }

  /* ******************************************************************* */
  /* CORE CHAT LOGIC */
  /* ******************************************************************* */

  function renderWelcome() {
    const savedMessages = readStorage(STORAGE_KEYS.messages, null);
    if (savedMessages && Array.isArray(savedMessages) && savedMessages.length) {
      STATE.messages = savedMessages;
      STATE.hasSentMessage = true;
      STATE.messages.forEach((m) => addMessage(m));
      return;
    }
    addBotMessage(t("welcome"));
  }

  function smartReply(message) {
    const text = message.trim().toLowerCase();

    if (text.includes("divorce") || text.includes("বিবাহবিচ্ছেদ")) {
      return { type: "faq", answer: "For divorce cases, we guide you through filing the petition, mediation processes, and court appearances. Share whether it is a Muslim or Civil matter so we can tailor guidance." };
    }
    if (text.includes("land") || text.includes("property") || text.includes("জমি")) {
      return { type: "service", service: "property", answer: "This matter may fall under Property and Land Law. Our firm assists with land verification, documentation, and dispute resolution." };
    }
    if (text.includes("company") || text.includes("register")) {
      return { type: "service", service: "corporate", answer: "Company registration involves name approval, MOA/AOA preparation, and RJSC filing. We handle the paperwork, registrations, and compliance for you." };
    }
    if (text.includes("urgent") || text.includes("arrest") || text.includes("police")) {
      return { type: "emergency", answer: "If you are under arrest or need urgent legal help, please contact our emergency number immediately." };
    }
    if (text.includes("faq") || text.includes("how to")) {
      return { type: "faq", answer: "Here are some common questions we can help with." };
    }
    const blogResults = recommendBlogArticles(text);
    if (blogResults.length) {
      return { type: "blog", answer: "I found some helpful articles from our blog:", articles: blogResults };
    }
    return { type: "default", answer: "I can help with legal questions, document review, and booking a consultation. Try asking a question, or upload a document." };
  }

  async function handleUserMessage(text) {
    const normalized = text.trim().toLowerCase();

    if (STATE.currentFlow?.startsWith("booking_")) {
      const field = STATE.currentFlow.replace("booking_", "");
      const visitor = ensureVisitorProfile();
      visitor[field] = text.trim();
      updateVisitorProfile(visitor);

      if (field === "date") {
        addBotMessage(t("appointmentSaved"));
        STATE.currentFlow = null;
        return;
      }

      const nextField = { name: "phone", phone: "email", email: "issue", issue: "date" }[field];
      if (nextField) {
        const prompts = {
          phone: "Great. What is your phone number?",
          email: "What is your email address?",
          issue: "Please briefly describe your legal issue.",
          date: "Please provide a preferred date for consultation (e.g. 2026-08-05).",
        };
        addBotMessage(prompts[nextField]);
        STATE.currentFlow = `booking_${nextField}`;
        return;
      }
    }

    if (normalized === "clear" || normalized === "restart") {
      writeStorage(STORAGE_KEYS.messages, []);
      const messagesEl = find(SELECTORS.messages);
      if (messagesEl) messagesEl.innerHTML = "";
      addBotMessage("Chat cleared. How can I help now?");
      return;
    }

    if (normalized.includes("faq")) {
      const buttons = CONFIG.faqs.map((faq, idx) => ({ label: faq.question, action: "faq", value: String(idx) }));
      addBotMessage("Here are some frequently asked questions:", { buttons });
      return;
    }

    if (normalized.includes("glossary") || normalized.includes("term")) {
      const buttons = Object.keys(CONFIG.glossary).map((term) => ({ label: term, action: "glossary", value: term }));
      addBotMessage("Select a term to learn more:", { buttons });
      return;
    }

    if (normalized.includes("scam") || normalized.includes("fraud")) {
      CONFIG.scamWarnings.forEach((warning) => addBotMessage(warning));
      return;
    }

    if (normalized.includes("office") || normalized.includes("address")) {
      addBotMessage(`${CONFIG.office.name}\n${CONFIG.office.address}\n${CONFIG.office.hours}\n${CONFIG.office.phone}`, {
        link: CONFIG.office.googleMaps,
        linkLabel: "Open in Google Maps",
      });
      return;
    }

    if (normalized.includes("english") || normalized.includes("বাংলা")) {
      toggleLanguage();
      return;
    }

    const typingEl = addTypingIndicator();
    const backendReply = await sendBackendMessage(text);
    removeTypingIndicator(typingEl);

    if (backendReply?.reply_text) {
      addBotMessage(backendReply.reply_text, {
        buttons: Array.isArray(backendReply.buttons) ? backendReply.buttons : undefined,
        recommendedAttorney: backendReply.recommended_attorney,
      });

      if (backendReply.next_flow) STATE.currentFlow = backendReply.next_flow;
      if (backendReply.escalation_required) {
        addBotMessage("For urgent matters, please call us now or continue on WhatsApp for immediate support.");
      }
      persistMessages();
      return;
    }

    const reply = smartReply(text);
    if (reply) {
      addBotMessage(reply.answer, { buttons: reply.type === "service" ? getServiceButtons() : undefined });
      if (reply.type === "blog") renderBlogRecommendations(reply.articles);
      persistMessages();
    }
  }

  function getServiceButtons() {
    return CONFIG.services.slice(0, 5).map((s) => ({ label: s.label, action: "service_link", value: s.id }));
  }

  function handleMetaAction(action, value) {
    switch (action) {
      case "open_map": {
        addBotMessage("Opening map...", { link: value || CONFIG.office.googleMaps, linkLabel: "Open in Google Maps" });
        break;
      }
      case "open_whatsapp": {
        addBotMessage("Opening WhatsApp...", { link: value || getWhatsAppLink(), linkLabel: "Open WhatsApp" });
        break;
      }
      case "open_phone":
      case "emergency_call": {
        addBotMessage("Tap to call now:", { link: value || `tel:${CONFIG.office.phone.replace(/\s+/g, "")}`, linkLabel: "Call Now" });
        break;
      }
      case "open_link": {
        if (value) window.open(value, "_blank", "noopener,noreferrer");
        break;
      }
      case "service_link": {
        const service = getServiceById(value);
        if (service) addBotMessage(`Opening ${service.label} page...`, { link: service.page, linkLabel: service.label });
        break;
      }
      case "faq": {
        const item = CONFIG.faqs[Number(value)];
        if (item) addBotMessage(item.answer);
        break;
      }
      case "glossary": {
        const explanation = CONFIG.glossary[String(value).toLowerCase()];
        if (explanation) addBotMessage(`${value}: ${explanation}`);
        break;
      }
      case "fill_booking": {
        const prompt = {
          name: "Please enter your full name.",
          phone: "Please enter your phone number.",
          email: "Please enter your email address.",
          issue: "Please briefly describe your legal issue.",
          date: "Please provide a preferred date (e.g. 2026-08-12).",
        }[value];
        if (prompt) {
          addBotMessage(prompt);
          STATE.currentFlow = `booking_${value}`;
        }
        break;
      }
      case "open_blog": {
        if (value) addBotMessage("Opening article...", { link: value, linkLabel: "Read article" });
        break;
      }
      default:
        break;
    }
  }

  function updateVisitorProfile(partial) {
    STATE.visitor = Object.assign({}, STATE.visitor || {}, partial);
    writeStorage(STORAGE_KEYS.visitor, STATE.visitor);
  }

  function ensureVisitorProfile() {
    const saved = readStorage(STORAGE_KEYS.visitor, {});
    STATE.visitor = Object.assign({}, saved);
    return STATE.visitor;
  }

  function persistMessages() {
    const messages = findAll(".kamal-chatbot-message").map((msg) => {
      const role = msg.classList.contains("kamal-chatbot-message--bot") ? "bot" : "user";
      const textEl = msg.querySelector(role === "bot" ? ".kamal-chatbot-bot-body" : ".kamal-chatbot-message-bubble");
      return { role, text: textEl ? textEl.textContent : "" };
    });
    writeStorage(STORAGE_KEYS.messages, messages);
  }

  function toggleLanguage() {
    STATE.language = STATE.language === "en" ? "bn" : "en";
    writeStorage(STORAGE_KEYS.lang, STATE.language);
    addBotMessage(`Language switched to ${getLangStrings().languageLabel}.`);
    renderSuggestions();
    const input = find(SELECTORS.input);
    if (input) input.placeholder = t("placeholder");
  }

  function loadState() {
    const visitor = readStorage(STORAGE_KEYS.visitor, null);
    if (visitor) STATE.visitor = visitor;

    STATE.backendVisitorId = readStorage(STORAGE_KEYS.backendVisitorId, null);
    STATE.backendConversationId = readStorage(STORAGE_KEYS.backendConversationId, null);
    STATE.lastInteractionAt = readStorage(STORAGE_KEYS.lastActive, Date.now());
  }

  function init() {
    renderChatbot();
    startBackendSession();

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".kamal-chatbot-meta-btn");
      if (!button) return;
      handleMetaAction(button.dataset.action, button.dataset.value);
    });

    document.body.addEventListener("click", () => touchActivity());
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
