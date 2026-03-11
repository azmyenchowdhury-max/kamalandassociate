/*
  Kamal & Associates Chatbot
  Author: Generated
  Description: A modular chatbot widget that provides legal guidance, lead capture,
  appointment booking, FAQs, and more. Works in Light/Dark mode and supports English/Bangla.
*/

;(function () {
  const CONFIG = {
    firmName: "Kamal & Associates",
    whatsappNumber: "+8801713456800",
    office: {
      name: "Kamal & Associates, Dhaka Office",
      address: "House 78, Road 10, Gulshan-1, Dhaka 1212",
      hours: "Sun - Thu: 9:00 AM - 7:00 PM",
      phone: "+880 1713 456 800",
      email: "info@kamalandassociate.com",
      googleMaps: "https://goo.gl/maps/e1v7wUj9ZoL2",
    },
    quickActions: [
      { id: "ask_question", label: "Ask a Legal Question", icon: "fas fa-question-circle" },
      { id: "find_lawyer", label: "Find a Lawyer", icon: "fas fa-user-tie" },
      { id: "book_consultation", label: "Book Consultation", icon: "fas fa-calendar-check" },
      { id: "services", label: "Legal Services", icon: "fas fa-briefcase" },
      { id: "upload_docs", label: "Upload Documents", icon: "fas fa-file-upload" },
      { id: "emergency", label: "Emergency Legal Help", icon: "fas fa-phone-volume" },
      { id: "office_location", label: "Office Location", icon: "fas fa-map-marker-alt" },
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
      affidavit:
        "An affidavit is a written statement sworn under oath before a notary or magistrate. It is used as evidence in court proceedings.",
      arbitration:
        "Arbitration is an alternative dispute resolution method where a neutral arbitrator renders a binding decision outside of court.",
      writpetiton:
        "A writ petition is a legal remedy filed before the High Court Division seeking enforcement of fundamental rights or judicial review.",
      injunction:
        "An injunction is a court order that directs a party to do or refrain from doing a specific act.",
    },
    blogArticles: [
      {
        title: "Company Formation in Bangladesh",
        url: "blog.html#company-formation",
        tags: ["company", "register", "business"],
      },
      {
        title: "How to File a Divorce Petition",
        url: "blog.html#divorce-process",
        tags: ["divorce", "family", "court"],
      },
      {
        title: "Land Verification and Due Diligence",
        url: "blog.html#land-verification",
        tags: ["land", "property", "documents"],
      },
      {
        title: "Understanding Writ Petitions in Bangladesh",
        url: "blog.html#writ-petition",
        tags: ["writ", "high court", "petition"],
      },
    ],
    scamWarnings: [
      "Always verify property titles at the sub-registrar office. Be wary of sellers offering extremely low prices without clear papers.",
      "Do not share your NID, passport, or banking details over email or WhatsApp without verifying the recipient.",
      "Beware of strangers promising quick court wins. Always consult a qualified attorney and ask for written fee agreements.",
    ],
    languages: {
      en: {
        welcome: "Hello! I'm your legal assistant. How can I help you today?",
        followUp: "Would you like to schedule a free consultation?",
        placeholder: "Type your message...",
        send: "Send",
        upload: "Upload",
        typing: "Typing...",
        online: "Online",
        offline: "Offline",
        legalDisclaimer:
          "This chatbot provides general legal information only and does not constitute legal advice.",
        languageLabel: "English",
        helpPrompt: "Start by selecting one of the quick actions below or type your question.",
        appointmentSaved: "Your consultation is confirmed. We'll contact you soon.",
        saved: "Saved.",
        thankYou: "Thank you!",
        getStarted: "Get Started",
        switchLanguage: "বাংলা",
      },
      bn: {
        welcome: "আপনাকে স্বাগতম। কী ধরনের আইনি সহায়তা প্রয়োজন?",
        followUp: "আপনি কি একটি ফ্রি পরামর্শের সময় নির্ধারণ করতে চান?",
        placeholder: "আপনার বার্তা লিখুন...",
        send: "পাঠান",
        upload: "আপলোড",
        typing: "টাইপ করছে...",
        online: "অনলাইন",
        offline: "অফলাইনে",
        legalDisclaimer:
          "এই চ্যাটবট সাধারণ আইনি তথ্য সরবরাহ করে এবং এটি আইনি পরামর্শ নয়।",
        languageLabel: "বাংলা",
        helpPrompt: "দয়া করে নীচের দ্রুত ক্রিয়াগুলির একটি নির্বাচন করুন বা আপনার প্রশ্ন টাইপ করুন।",
        appointmentSaved: "আপনার পরামর্শ নিশ্চিত করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
        saved: "সংরক্ষণ করা হয়েছে।",
        thankYou: "ধন্যবাদ!",
        getStarted: "শুরু করুন",
        switchLanguage: "English",
      },
    },
  };

  const STORAGE_KEYS = {
    visitor: "kamal_chatbot_visitor",
    leads: "kamal_chatbot_leads",
    messages: "kamal_chatbot_messages",
    lang: "kamal_chatbot_lang",
    lastActive: "kamal_chatbot_last_active",
    followUp: "kamal_chatbot_followup_sent",
    currentFlow: "kamal_chatbot_current_flow",
  };

  const STATE = {
    isOpen: false,
    language: "en",
    visitor: null,
    messages: [],
    currentFlow: null,
    lastInteractionAt: Date.now(),
  };

  const SELECTORS = {
    root: "#kamal-chatbot-root",
    bubble: ".kamal-chatbot-bubble",
    window: ".kamal-chatbot-window",
    messages: ".kamal-chatbot-messages",
    input: ".kamal-chatbot-input",
    sendBtn: ".kamal-chatbot-send",
    attachBtn: ".kamal-chatbot-attach",
    quickActions: ".kamal-chatbot-quick-actions",
    languageToggle: ".kamal-chatbot-language-toggle",
    whatsappBtn: ".kamal-chatbot-whatsapp",
  };

  const UTILS = {
    formatDate: (d) => {
      const date = new Date(d);
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    debounce: (fn, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    },
  };

  function recommendBlogArticles(text) {
    const keywords = (text || "").toLowerCase();
    const matches = CONFIG.blogArticles.filter((article) =>
      article.tags.some((tag) => keywords.includes(tag))
    );
    return matches.slice(0, 3);
  }

  function renderBlogRecommendations(articles) {
    if (!articles || !articles.length) return;
    addBotMessage("You may find these articles helpful:", {
      meta: {
        buttons: articles.map((article) => ({
          label: article.title,
          action: "open_blog",
          value: article.url,
        })),
      },
    });
  }

  /* ******************************************************************* */
  /* UTILITIES */
  /* ******************************************************************* */

  function log(...args) {
    if (window.console && window.console.log) {
      console.log("[Chatbot]", ...args);
    }
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

  function smartReply(message) {
    const text = message.trim().toLowerCase();

    // Basic intent matching
    if (text.includes("divorce") || text.includes("বিবাহবিচ্ছেদ")) {
      return {
        type: "faq",
        answer:
          "For divorce cases, we guide you through filing the petition, mediation processes, and court appearances. Share whether it is a Muslim or Civil matter so we can tailor guidance.",
      };
    }

    if (text.includes("land") || text.includes("property") || text.includes("জমি")) {
      return {
        type: "service",
        service: "property",
        answer:
          "This matter may fall under Property and Land Law. Our firm assists with land verification, documentation, and dispute resolution.",
      };
    }

    if (text.includes("company") || text.includes("register") || text.includes("company registration")) {
      return {
        type: "service",
        service: "corporate",
        answer:
          "Company registration involves name approval, MOA/AOA preparation, and RJSC filing. We handle the paperwork, registrations, and compliance for you.",
      };
    }

    if (text.includes("urgent") || text.includes("arrest") || text.includes("police")) {
      return {
        type: "emergency",
        answer:
          "If you are under arrest or need urgent legal help, please contact our emergency number immediately. We can dispatch an attorney right away.",
      };
    }

    if (text.includes("faq") || text.includes("how to")) {
      return { type: "faq", answer: t("helpPrompt") };
    }

    if (text.includes("upload") || text.includes("document")) {
      return { type: "upload", answer: "Please upload the relevant documents here. We review them securely." };
    }

    const blogResults = recommendBlogArticles(text);
    if (blogResults.length) {
      return {
        type: "blog",
        answer: "I found some helpful articles from our blog:",
        articles: blogResults,
      };
    }

    // Default fallback
    return {
      type: "default",
      answer:
        "I can help with legal services, consultation booking, FAQs, and document guidance. Try asking: 'How do I register a company?' or click a quick action below.",
    };
  }

  function getServiceById(id) {
    return CONFIG.services.find((s) => s.id === id);
  }

  function createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") {
        el.className = value;
      } else if (key === "dataset") {
        Object.entries(value).forEach(([k, v]) => (el.dataset[k] = v));
      } else if (key === "aria") {
        Object.entries(value).forEach(([k, v]) => el.setAttribute(`aria-${k}`, v));
      } else if (key === "html") {
        el.innerHTML = value;
      } else if (key === "text") {
        el.textContent = value;
      } else {
        el.setAttribute(key, value);
      }
    });
    children.forEach((child) => {
      if (child == null) return;
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
    return el;
  }

  function find(selector) {
    return document.querySelector(selector);
  }

  function findAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  /* ******************************************************************* */
  /* CHATBOT RENDERING */
  /* ******************************************************************* */

  function renderChatbot() {
    const existingRoot = find(SELECTORS.root);
    if (existingRoot) return;

    const root = createElement("div", { id: "kamal-chatbot-root" });
    document.body.appendChild(root);

    // Floating bubble
    const bubble = createElement(
      "button",
      {
        class: "kamal-chatbot-bubble",
        type: "button",
        "aria-label": "Open chat",
        title: "Ask a Legal Question",
      },
      createElement("span", { class: "kamal-chatbot-bubble-icon" }, createElement("i", { class: "fas fa-comments" })),
      createElement("span", { class: "kamal-chatbot-tooltip" }, "Ask a Legal Question")
    );

    // Chat window
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
            "button",
            {
              type: "button",
              class: "kamal-chatbot-btn icon-btn kamal-chatbot-language-toggle",
              title: t("switchLanguage"),
            },
            createElement("span", { class: "fas fa-globe" })
          ),
          createElement(
            "button",
            {
              type: "button",
              class: "kamal-chatbot-btn icon-btn kamal-chatbot-close",
              title: "Close chat",
            },
            createElement("span", { class: "fas fa-times" })
          )
        )
      ),
      createElement(
        "div",
        { class: "kamal-chatbot-body" },
        createElement("div", { class: "kamal-chatbot-messages" }),
        createElement(
          "div",
          { class: "kamal-chatbot-quick-actions" },
          ...CONFIG.quickActions.map((action) =>
            createElement(
              "button",
              {
                type: "button",
                class: "kamal-chatbot-quick-action",
                dataset: { action: action.id },
              },
              createElement("span", { class: action.icon }),
              createElement("span", { class: "kamal-chatbot-quick-label" }, action.label)
            )
          )
        )
      ),
      createElement(
        "footer",
        { class: "kamal-chatbot-footer" },
        createElement("button", {
          type: "button",
          class: "kamal-chatbot-btn icon-btn kamal-chatbot-attach",
          title: "Upload documents",
        },
        createElement("span", { class: "fas fa-paperclip" })),
        createElement("input", {
          type: "text",
          class: "kamal-chatbot-input",
          placeholder: t("placeholder"),
          "aria-label": t("placeholder"),
        }),
        createElement(
          "button",
          { type: "button", class: "kamal-chatbot-btn kamal-chatbot-send" },
          t("send")
        ),
        createElement(
          "a",
          {
            class: "kamal-chatbot-btn kamal-chatbot-whatsapp",
            href: getWhatsAppLink(),
            target: "_blank",
            rel: "noopener noreferrer",
            title: "Continue on WhatsApp",
          },
          createElement("span", { class: "fab fa-whatsapp" }),
          createElement("span", { class: "kamal-chatbot-whatsapp-text" }, "WhatsApp")
        )
      ),
      createElement(
        "div",
        { class: "kamal-chatbot-footer-note" },
        t("legalDisclaimer")
      )
    );

    root.appendChild(bubble);
    root.appendChild(windowEl);

    attachEvents();
    loadState();
    renderWelcome();
    scheduleFollowUp();
  }

  function getWhatsAppLink() {
    const phone = CONFIG.whatsappNumber.replace(/\D/g, "");
    const text = encodeURIComponent("Hello, I need legal help from Kamal & Associates.");
    return `https://wa.me/${phone}?text=${text}`;
  }

  /* ******************************************************************* */
  /* EVENT HANDLERS */
  /* ******************************************************************* */

  function attachEvents() {
    const root = find(SELECTORS.root);
    if (!root) return;

    root.addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;

      if (btn.matches(SELECTORS.bubble) || btn.closest(SELECTORS.bubble)) {
        toggleChat();
      }

      if (btn.matches(".kamal-chatbot-close")) {
        closeChat();
      }

      if (btn.matches(SELECTORS.languageToggle) || btn.closest(SELECTORS.languageToggle)) {
        toggleLanguage();
      }

      if (btn.matches(SELECTORS.sendBtn) || btn.closest(SELECTORS.sendBtn)) {
        submitMessage();
      }

      if (btn.matches(SELECTORS.attachBtn) || btn.closest(SELECTORS.attachBtn)) {
        promptFileUpload();
      }

      if (btn.matches(".kamal-chatbot-quick-action")) {
        const action = btn.dataset.action;
        handleQuickAction(action);
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

      input.addEventListener(
        "input",
        UTILS.debounce(() => {
          STATE.lastInteractionAt = Date.now();
          writeStorage(STORAGE_KEYS.lastActive, STATE.lastInteractionAt);
        }, 500)
      );
    }

    window.addEventListener("click", (event) => {
      if (!STATE.isOpen) return;
      const windowEl = find(SELECTORS.window);
      const bubble = find(SELECTORS.bubble);
      if (!windowEl || !bubble) return;
      if (event.target === bubble || bubble.contains(event.target)) return;
      if (windowEl.contains(event.target)) return;
      // close chat when click outside
      closeChat();
    });

    window.addEventListener("focus", () => {
      STATE.lastInteractionAt = Date.now();
      writeStorage(STORAGE_KEYS.lastActive, STATE.lastInteractionAt);
    });

    // Sync language with stored preference
    const lang = readStorage(STORAGE_KEYS.lang, null);
    if (lang) {
      STATE.language = lang;
    }
  }

  function scheduleFollowUp() {
    clearTimeout(STATE.followUpTimeout);
    const followUpDelay = 90_000; // 1.5 minutes
    STATE.followUpTimeout = setTimeout(() => {
      const lastActive = readStorage(STORAGE_KEYS.lastActive, Date.now());
      const now = Date.now();
      if (now - lastActive > 60_000 && !readStorage(STORAGE_KEYS.followUp, false)) {
        sendBotMessage(t("followUp"));
        writeStorage(STORAGE_KEYS.followUp, true);
      }
    }, followUpDelay);
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
      scheduleFollowUp();
    } else {
      windowEl.classList.remove("open");
      bubble.classList.remove("active");
      windowEl.setAttribute("aria-hidden", "true");
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
  }

  function focusInput() {
    const input = find(SELECTORS.input);
    if (input) {
      input.focus();
    }
  }

  function submitMessage(raw = null) {
    const input = find(SELECTORS.input);
    if (!input) return;
    const message = raw !== null ? raw : input.value.trim();
    if (!message) return;

    addUserMessage(message);
    input.value = "";
    handleUserMessage(message);
  }

  function promptFileUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    input.onchange = () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      addBotMessage(t("saved"));
      addUserMessage(`Uploaded ${files.length} file(s)`);
      // In production, files would be uploaded to a server.
    };
    input.click();
  }

  /* ******************************************************************* */
  /* MESSAGE API */
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
      const bubble = createElement("div", { class: "kamal-chatbot-bubble bot" });
      bubble.textContent = text;
      msg.appendChild(bubble);
    } else {
      const bubble = createElement("div", { class: "kamal-chatbot-bubble user" });
      bubble.textContent = text;
      msg.appendChild(bubble);
    }

    if (meta?.link) {
      const link = createElement("a", {
        class: "kamal-chatbot-meta-link",
        href: meta.link,
        target: "_blank",
        rel: "noopener noreferrer",
      });
      link.textContent = meta.linkLabel || meta.link;
      msg.appendChild(link);
    }

    if (meta?.buttons) {
      const actions = createElement("div", { class: "kamal-chatbot-meta-actions" });
      meta.buttons.forEach((btn) => {
        const actionBtn = createElement(
          "button",
          {
            type: "button",
            class: "kamal-chatbot-meta-btn",
            dataset: { action: btn.action, value: btn.value || "" },
          },
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
    STATE.lastInteractionAt = Date.now();
    writeStorage(STORAGE_KEYS.lastActive, STATE.lastInteractionAt);
    scheduleFollowUp();
  }

  function addUserMessage(text) {
    addMessage({ role: "user", text });
    STATE.lastInteractionAt = Date.now();
    writeStorage(STORAGE_KEYS.lastActive, STATE.lastInteractionAt);
  }

  /* ******************************************************************* */
  /* CORE CHAT LOGIC */
  /* ******************************************************************* */

  function renderWelcome() {
    const savedWelcome = readStorage(STORAGE_KEYS.messages, null);
    if (savedWelcome && Array.isArray(savedWelcome) && savedWelcome.length) {
      STATE.messages = savedWelcome;
      STATE.messages.forEach((m) => addMessage(m));
      return;
    }

    const greeting = t("welcome");
    addBotMessage(greeting, {
      buttons: [
        { label: t("getStarted"), action: "quick_start" },
        { label: t("switchLanguage"), action: "switch_language" },
      ],
    });
    addBotMessage(t("helpPrompt"));
  }

  function handleQuickAction(action) {
    switch (action) {
      case "ask_question":
        addBotMessage("Sure! What's your legal concern?", { meta: { } });
        focusInput();
        break;
      case "find_lawyer":
        suggestAttorney();
        break;
      case "book_consultation":
        startBookingFlow();
        break;
      case "services":
        showServiceLinks();
        break;
      case "upload_docs":
        promptFileUpload();
        break;
      case "emergency":
        showEmergencyOptions();
        break;
      case "office_location":
        showOfficeInfo();
        break;
      default:
        addBotMessage("Let me know how I can assist you.");
    }
  }

  function handleUserMessage(text) {
    const normalized = text.trim().toLowerCase();

    // Booking subflow (collect visitor details)
    if (STATE.currentFlow?.startsWith("booking_")) {
      const field = STATE.currentFlow.replace("booking_", "");
      const visitor = ensureVisitorProfile();
      visitor[field] = text.trim();
      updateVisitorProfile(visitor);

      if (field === "date") {
        addBotMessage(t("appointmentSaved"));
        scheduleAppointmentReminder(visitor);
        STATE.currentFlow = null;
        return;
      }

      const nextField = {
        name: "phone",
        phone: "email",
        email: "issue",
        issue: "date",
      }[field];

      if (nextField) {
        const prompts = {
          phone: "Great. What is your phone number?",
          email: "What is your email address?",
          issue: "Please briefly describe your legal issue.",
          date: "Please provide a preferred date for consultation (e.g. 2024-06-05).",
        };
        addBotMessage(prompts[nextField]);
        STATE.currentFlow = `booking_${nextField}`;
        return;
      }
    }

    // Case intake flow
    if (STATE.currentFlow === "case_intake_location") {
      addBotMessage(`Thanks. We'll review this case type (${STATE.caseType}) in ${text.trim()}.`);
      const summary = `Case Summary:\nType: ${STATE.caseType}\nLocation: ${text.trim()}\n(Our team will reach out for additional details.)`;
      addBotMessage(summary);
      STATE.currentFlow = null;
      return;
    }

    if (normalized === "clear" || normalized === "restart") {
      writeStorage(STORAGE_KEYS.messages, []);
      addBotMessage("Chat progress cleared. How can I assist now?");
      return;
    }

    if (normalized.includes("faq")) {
      showFaq();
      return;
    }

    if (normalized.includes("book") || normalized.includes("consult")) {
      startBookingFlow();
      return;
    }

    if (normalized.includes("service")) {
      showServiceLinks();
      return;
    }

    if (normalized.includes("office") || normalized.includes("address")) {
      showOfficeInfo();
      return;
    }

    if (normalized.includes("whatsapp")) {
      addBotMessage("You can continue on WhatsApp using the button below.");
      return;
    }

    if (normalized.includes("glossary") || normalized.includes("term")) {
      showGlossary();
      return;
    }

    if (normalized.includes("scam") || normalized.includes("fraud")) {
      showScamWarnings();
      return;
    }

    if (normalized.includes("court")) {
      showCourtInfo();
      return;
    }

    if (normalized.includes("appointment") || normalized.includes("reminder")) {
      showAppointmentReminder();
      return;
    }

    // Recognize language switch request
    if (normalized.includes("english") || normalized.includes("বাংলা")) {
      toggleLanguage();
      return;
    }

    // Booking by detection of date
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(normalized) || /tomorrow|today|next/.test(normalized)) {
      startBookingFlow({ dateHint: normalized });
      return;
    }

    // Document checklist request
    if (normalized.includes("document") || normalized.includes("checklist")) {
      showDocumentChecklist();
      return;
    }

    // Smart case intake: ask for case type
    if (normalized.includes("case") || normalized.includes("type")) {
      startCaseIntake();
      return;
    }

    // Basic guided response
    const reply = smartReply(text);
    if (reply) {
      addBotMessage(reply.answer, {
        buttons: reply.type === "service" ? getServiceButtons() : undefined,
      });

      if (reply.type === "service" && reply.service) {
        suggestAttorney(reply.service);
      }

      if (reply.type === "blog") {
        renderBlogRecommendations(reply.articles);
      }

      // Persist messages for returning visitors
      persistMessages();
    }
  }

  function getServiceButtons() {
    return CONFIG.services.slice(0, 5).map((s) => ({ label: s.label, action: "service_link", value: s.id }));
  }

  function showServiceLinks() {
    const buttons = CONFIG.services.map((service) => ({ label: service.label, action: "service_link", value: service.id }));
    addBotMessage("Here are the main practice areas we support:", { buttons });
  }

  function showFaq() {
    const buttons = CONFIG.faqs.map((faq, idx) => ({ label: faq.question, action: "faq", value: String(idx) }));
    addBotMessage("Here are some frequently asked questions:", { buttons });
  }

  function showGlossary() {
    const terms = Object.keys(CONFIG.glossary);
    const buttons = terms.map((term) => ({ label: term, action: "glossary", value: term }));
    addBotMessage("Select a term to learn more:", { buttons });
  }

  function showScamWarnings() {
    CONFIG.scamWarnings.forEach((warning) => addBotMessage(warning));
  }

  function showCourtInfo() {
    addBotMessage(
      "In Bangladesh, civil and criminal matters are handled in District Courts and High Courts. Land disputes are usually filed in District Courts or the Land Tribunals."
    );
    addBotMessage(
      "Court working hours are generally 10:00 AM to 5:00 PM (Sun-Thu). Filing procedures typically require a petition, supporting documents, and a court fee.",
      { meta: { link: "https://www.supremecourt.gov.bd/", linkLabel: "Bangladesh Supreme Court" } }
    );
  }

  function showOfficeInfo() {
    addBotMessage(`Office: ${CONFIG.office.name}`);
    addBotMessage(`Address: ${CONFIG.office.address}`);
    addBotMessage(`Hours: ${CONFIG.office.hours}`);
    addBotMessage(`Phone: ${CONFIG.office.phone}`);
    addBotMessage(`Email: ${CONFIG.office.email}`);
    addBotMessage("Find us on Google Maps:", {
      meta: { link: CONFIG.office.googleMaps, linkLabel: "Open in Google Maps" },
    });
    requestLocationPermission();
  }

  function requestLocationPermission() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        addBotMessage(
          "Location detected. Based on your location, we recommend visiting our Dhaka office or calling our local number.",
          {
            meta: {
              link: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
              linkLabel: "View Nearby Offices",
            },
          }
        );
      },
      () => {
        // user denied or unavailable
      }
    );
  }

  function showDocumentChecklist() {
    addBotMessage("Here is a typical checklist for company registration:", {
      meta: {
        linkLabel: "Copy checklist",
        buttons: [
          { label: "Copy checklist", action: "copy_checklist" },
        ],
      },
    });
    addBotMessage(
      "• NID copy of directors\n• Proposed company name\n• Shareholder details\n• Registered office address"
    );
  }

  function suggestAttorney(topic) {
    const recommendations = {
      family: "For family matters you may consult Advocate Kamal.",
      criminal: "For criminal defense, Advocate Rashed is available for immediate consultation.",
      corporate: "For corporate matters, Advocate Nasrin is experienced in company formation and compliance.",
      property: "For property disputes, Advocate Harun specializes in land verification and disputes.",
      immigration: "For immigration matters, Advocate Mahadi can assist with visa and residency applications.",
    };
    const message = topic && recommendations[topic] ? recommendations[topic] : "We have a team of experienced attorneys ready to assist you.";
    addBotMessage(message);
  }

  function startBookingFlow(hints) {
    STATE.currentFlow = "booking";
    const visitor = ensureVisitorProfile();
    const formId = `booking-${Date.now()}`;

    addBotMessage("Great! Let's schedule a consultation. Please provide the following details.");
    addBotMessage("Name:", {
      buttons: [
        { label: visitor.name || "Enter Name", action: "fill_booking", value: "name" },
      ],
    });
    addBotMessage("Phone:", {
      buttons: [
        { label: visitor.phone || "Enter Phone", action: "fill_booking", value: "phone" },
      ],
    });
    addBotMessage("Email:", {
      buttons: [
        { label: visitor.email || "Enter Email", action: "fill_booking", value: "email" },
      ],
    });
    addBotMessage("Legal Issue:", {
      buttons: [
        { label: "Describe issue", action: "fill_booking", value: "issue" },
      ],
    });
    addBotMessage("Preferred Date:", {
      buttons: [
        { label: "Select date", action: "fill_booking", value: "date" },
      ],
    });

    // Save placeholder to localStorage
    writeStorage(STORAGE_KEYS.currentFlow, "booking");
  }

  function startCaseIntake() {
    STATE.currentFlow = "case_intake";
    addBotMessage("Let's gather a few details to understand your case.");
    addBotMessage("What type of case is it?", {
      buttons: [
        { label: "Criminal", action: "case_type", value: "criminal" },
        { label: "Family", action: "case_type", value: "family" },
        { label: "Business", action: "case_type", value: "business" },
        { label: "Property", action: "case_type", value: "property" },
        { label: "Immigration", action: "case_type", value: "immigration" },
      ],
    });
  }

  function showAppointmentReminder() {
    const reminders = readStorage("kamal_chatbot_appointments", []);
    if (!reminders.length) {
      addBotMessage("You do not have any upcoming reminders. You can book a consultation to set one.");
      return;
    }
    reminders.forEach((rem) => {
      addBotMessage(`Reminder: ${rem.reason} on ${rem.date}`);
    });
  }

  function handleMetaAction(action, value) {
    switch (action) {
      case "service_link": {
        const service = getServiceById(value);
        if (service) {
          addBotMessage(`Opening ${service.label} page...`, {
            meta: { link: service.page, linkLabel: service.label },
          });
        }
        break;
      }
      case "faq": {
        const idx = Number(value);
        const item = CONFIG.faqs[idx];
        if (item) {
          addBotMessage(item.answer);
        }
        break;
      }
      case "glossary": {
        const term = value;
        const explanation = CONFIG.glossary[term.toLowerCase()];
        if (explanation) {
          addBotMessage(`${term}: ${explanation}`);
        }
        break;
      }
      case "copy_checklist": {
        const checklist =
          "NID copy of directors\nProposed company name\nShareholder details\nRegistered office address";
        navigator.clipboard
          .writeText(checklist)
          .then(() => addBotMessage("Checklist copied to clipboard."))
          .catch(() => addBotMessage("Unable to copy checklist."));
        break;
      }
      case "open_blog": {
        if (value) {
          addBotMessage("Opening article...", {
            meta: { link: value, linkLabel: "Read article" },
          });
        }
        break;
      }
      case "fill_booking": {
        const field = value;
        const prompt = {
          name: "Please enter your full name.",
          phone: "Please enter your phone number.",
          email: "Please enter your email address.",
          issue: "Please briefly describe your legal issue.",
          date: "Please provide a preferred date (e.g. 2024-05-12).",
        }[field];
        if (prompt) {
          addBotMessage(prompt);
          STATE.currentFlow = `booking_${field}`;
        }
        break;
      }
      case "case_type": {
        const caseType = value;
        addBotMessage(`Thank you. You selected ${caseType} case.`);
        addBotMessage("Please provide the city or district where this matter is located.");
        STATE.currentFlow = `case_intake_location`;
        STATE.caseType = caseType;
        break;
      }
      case "quick_start": {
        addBotMessage(t("helpPrompt"));
        break;
      }
      case "switch_language": {
        toggleLanguage();
        break;
      }
      default:
        addBotMessage("Action not recognized. Please type your request.");
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
    const messages = Array.from(document.querySelectorAll(".kamal-chatbot-message")).map((msg) => {
      const role = msg.classList.contains("kamal-chatbot-message--bot") ? "bot" : "user";
      const textEl = msg.querySelector(".kamal-chatbot-bubble");
      return { role, text: textEl ? textEl.textContent : "" };
    });
    writeStorage(STORAGE_KEYS.messages, messages);
  }

  function handleChatbotInput(text) {
    const NORMAL = text.trim();
    if (!NORMAL) return;

    // If we're in a booking subflow
    if (STATE.currentFlow?.startsWith("booking_")) {
      const field = STATE.currentFlow.replace("booking_", "");
      const visitor = ensureVisitorProfile();
      visitor[field] = NORMAL;
      updateVisitorProfile(visitor);
      if (field === "date") {
        addBotMessage(t("appointmentSaved"));
        scheduleAppointmentReminder(visitor);
        STATE.currentFlow = null;
        return;
      }
      const nextField = {
        name: "phone",
        phone: "email",
        email: "issue",
        issue: "date",
      }[field];
      if (nextField) {
        addBotMessage(
          {
            phone: "Great. What is your email address?",
            email: "What is your legal issue?",
            issue: "Please provide a preferred consultation date (e.g. 2024-06-05).",
          }[field]
        );
        STATE.currentFlow = `booking_${nextField}`;
        return;
      }
    }

    // Case intake flow
    if (STATE.currentFlow === "case_intake_location") {
      addBotMessage(`Thanks. We'll review this case type (${STATE.caseType}) in ${NORMAL}.`);
      const summary = `Case Summary:\nType: ${STATE.caseType}\nLocation: ${NORMAL}\n(Our team will reach out for additional details.)`;
      addBotMessage(summary);
      STATE.currentFlow = null;
      return;
    }

    // Handle meta buttons
    const lastMessage = document.querySelector(".kamal-chatbot-message:last-child");
    const metaButtons = lastMessage?.querySelectorAll(".kamal-chatbot-meta-btn");
    if (metaButtons && metaButtons.length) {
      // nothing to do here, buttons handle actions
    }

    // Else: treat as free text message
    addUserMessage(NORMAL);
    handleUserMessage(NORMAL);
  }

  function scheduleAppointmentReminder(visitor) {
    const reminders = readStorage("kamal_chatbot_appointments", []);
    reminders.push({
      date: visitor.date || "",
      reason: visitor.issue || "Consultation",
      createdAt: Date.now(),
    });
    writeStorage("kamal_chatbot_appointments", reminders);
  }

  function toggleLanguage() {
    STATE.language = STATE.language === "en" ? "bn" : "en";
    writeStorage(STORAGE_KEYS.lang, STATE.language);
    addBotMessage(`Language switched to ${getLangStrings().languageLabel}.`);
  }

  function loadState() {
    const visitor = readStorage(STORAGE_KEYS.visitor, null);
    if (visitor) {
      STATE.visitor = visitor;
    }
    const lastActive = readStorage(STORAGE_KEYS.lastActive, Date.now());
    STATE.lastInteractionAt = lastActive;
  }

  function init() {
    renderChatbot();

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".kamal-chatbot-meta-btn");
      if (!button) return;
      const action = button.dataset.action;
      const value = button.dataset.value;
      if (action) {
        handleMetaAction(action, value);
      }
    });

    document.addEventListener("submit", (event) => {
      if (event.target.matches(".kamal-chatbot-input")) {
        event.preventDefault();
        submitMessage();
      }
    });

    // Reschedule follow-up on any user interaction
    document.body.addEventListener("click", () => {
      STATE.lastInteractionAt = Date.now();
      writeStorage(STORAGE_KEYS.lastActive, STATE.lastInteractionAt);
      scheduleFollowUp();
    });

    // Initial greeting
    setTimeout(() => {
      // open automatically on first visit
      const isReturning = !!readStorage(STORAGE_KEYS.visitor, null);
      if (!isReturning) {
        toggleChat();
      }
    }, 1500);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
