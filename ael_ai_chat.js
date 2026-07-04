(function() {
  'use strict';

  const STORAGE_KEYS = {
    settings: 'ael_chat_settings',
    conversations: 'ael_chat_conversations',
    messages: 'ael_chat_messages',
    currentId: 'ael_chat_current_id',
  };

  const MODELS = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', icon: '🧠', color: '#10a37f', desc: 'Latest GPT-4 model with vision capabilities and 128K context window. Best for complex reasoning, analysis, and creative tasks.', tags: ['128K Context', 'Vision', 'Most Capable'], price: '$0.01/1K input' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', icon: '🧠', color: '#10a37f', desc: 'Previous generation GPT-4 with strong reasoning abilities. Reliable for professional content, code generation, and problem-solving.', tags: ['8K Context', 'Reliable', 'Strong Reasoning'], price: '$0.03/1K input' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: '⚡', color: '#10a37f', desc: 'Fast and cost-effective model for simple tasks, translations, and quick responses. Best value for high-volume usage.', tags: ['Fast', 'Cheap', '16K Context'], price: '$0.0015/1K input' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: '🎯', color: '#d97757', desc: 'Most powerful Claude model with deep reasoning and nuanced understanding. Excels at complex analysis, coding, and long-form content.', tags: ['200K Context', 'Deep Reasoning', 'Premium'], price: '$0.015/1K input' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', icon: '🎯', color: '#d97757', desc: 'Balanced Claude model offering strong performance at lower cost. Ideal for most everyday tasks and professional use.', tags: ['200K Context', 'Balanced', 'Fast'], price: '$0.003/1K input' },
    { id: 'demo', name: 'Demo Mode', provider: 'Local', icon: '🔌', color: '#64748b', desc: 'Simulated responses for testing and demonstration. No API key required. Perfect for previewing the interface before connecting to real models.', tags: ['Free', 'No API Key', 'Test'], price: 'Free' },
  ];

  let state = {
    settings: loadSettings(),
    conversations: loadConversations(),
    currentConversationId: null,
    messages: [],
    isProcessing: false,
  };

  const DOM = {};
  const cacheDOM = () => {
    DOM.navLinks = document.getElementById('navLinks');
    DOM.navToggle = document.getElementById('navToggle');
    DOM.navbar = document.getElementById('navbar');
    DOM.cursorGlow = document.getElementById('cursorGlow');
    DOM.chatMessages = document.getElementById('chatMessages');
    DOM.chatInput = document.getElementById('chatInput');
    DOM.chatSend = document.getElementById('chatSend');
    DOM.chatStatus = document.getElementById('chatStatus');
    DOM.chatModelSelect = document.getElementById('chatModelSelect');
    DOM.chatClear = document.getElementById('chatClear');
    DOM.chatExport = document.getElementById('chatExport');
    DOM.charCount = document.getElementById('charCount');
    DOM.modelsGrid = document.getElementById('modelsGrid');
    DOM.historyList = document.getElementById('historyList');
    DOM.historyRefresh = document.getElementById('historyRefresh');
    DOM.historyClearAll = document.getElementById('historyClearAll');
    DOM.heroCta = document.getElementById('heroCta');
    DOM.statConversations = document.getElementById('statConversations');
    DOM.statMessages = document.getElementById('statMessages');
    DOM.settingsSave = document.getElementById('settingsSave');
    DOM.settingsClear = document.getElementById('settingsClear');
    DOM.settingModel = document.getElementById('settingModel');
    DOM.settingTemp = document.getElementById('settingTemp');
    DOM.settingTokens = document.getElementById('settingTokens');
    DOM.tempValue = document.getElementById('tempValue');
    DOM.tokensValue = document.getElementById('tokensValue');
    DOM.settingSystemPrompt = document.getElementById('settingSystemPrompt');
    DOM.apiKeyOpenAI = document.getElementById('apiKeyOpenAI');
    DOM.apiKeyAnthropic = document.getElementById('apiKeyAnthropic');
  };

  // Load/Save
  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      apiKeyOpenAI: '',
      apiKeyAnthropic: '',
      model: 'demo',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: 'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-structured responses.',
    };
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }

  function loadConversations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.conversations);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  function saveConversations() {
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(state.conversations));
    updateStats();
  }

  function loadMessages(conversationId) {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.messages}_${conversationId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  function saveMessages(conversationId, messages) {
    localStorage.setItem(`${STORAGE_KEYS.messages}_${conversationId}`, JSON.stringify(messages));
  }

  // Navigation
  function initNavigation() {
    const navItems = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    const activateSection = (id) => {
      sections.forEach(s => s.classList.remove('active'));
      navItems.forEach(n => n.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) target.classList.add('active');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) link.classList.add('active');
      DOM.navLinks.classList.remove('open');
    };

    navItems.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        activateSection(id);
      });
    });

    if (DOM.heroCta) {
      DOM.heroCta.addEventListener('click', e => {
        e.preventDefault();
        activateSection('chat');
      });
    }

    const hash = location.hash.slice(1) || 'overview';
    activateSection(hash);
  }

  // Models
  function renderModels() {
    if (!DOM.modelsGrid) return;
    DOM.modelsGrid.innerHTML = MODELS.map(m => `
      <div class="model-card glass">
        <div class="model-card-header">
          <div class="model-icon" style="background:${m.color}22;border:1px solid ${m.color}44">${m.icon}</div>
          <div>
            <div class="model-name" style="color:${m.color}">${m.name}</div>
            <div class="model-provider">${m.provider}</div>
          </div>
        </div>
        <div class="model-desc">${m.desc}</div>
        <div class="model-tags">
          ${m.tags.map(t => `<span class="model-tag">${t}</span>`).join('')}
          <span class="model-tag gold">${m.price}</span>
        </div>
      </div>
    `).join('');
  }

  // Chat
  function createNewConversation() {
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    const name = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
    const conv = { id, name, model: state.settings.model, createdAt: Date.now(), messageCount: 0 };
    state.conversations.unshift(conv);
    state.currentConversationId = id;
    state.messages = [];
    saveConversations();
    saveMessages(id, []);
    renderHistory();
    return conv;
  }

  function getOrCreateConversation() {
    if (state.currentConversationId && state.conversations.find(c => c.id === state.currentConversationId)) {
      return state.currentConversationId;
    }
    const conv = createNewConversation();
    return conv.id;
  }

  function renderMessage(msg, isNew = false) {
    const div = document.createElement('div');
    div.className = `message ${msg.role}`;
    div.dataset.id = msg.id;

    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = msg.role === 'user';
    const avatarText = isUser ? 'U' : (msg.model === 'demo' ? 'DM' : 'AI');

    div.innerHTML = `
      <div class="msg-avatar">${avatarText}</div>
      <div class="msg-content">
        <div class="msg-author">${isUser ? 'You' : (msg.model === 'demo' ? 'Demo' : msg.modelName || 'Assistant')}</div>
        <div class="msg-text">${formatMessage(msg.content)}</div>
        <div class="msg-time">${time}</div>
      </div>
    `;

    if (isNew) {
      DOM.chatMessages.appendChild(div);
      DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    }
    return div;
  }

  function formatMessage(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message assistant';
    div.id = 'typingIndicator';
    div.innerHTML = `
      <div class="msg-avatar" style="background:rgba(0,116,255,.2);color:var(--primary);border:1px solid rgba(0,116,255,.3)">AI</div>
      <div class="msg-content">
        <div class="msg-author">${state.settings.model === 'demo' ? 'Demo' : 'Assistant'}</div>
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    DOM.chatMessages.appendChild(div);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function updateCharCount() {
    const len = DOM.chatInput.value.length;
    DOM.charCount.textContent = len;
    DOM.chatSend.disabled = !len.trim() || state.isProcessing;
  }

  async function handleSend() {
    const text = DOM.chatInput.value.trim();
    if (!text || state.isProcessing) return;

    const convId = getOrCreateConversation();
    const conv = state.conversations.find(c => c.id === convId);

    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      model: state.settings.model,
      modelName: MODELS.find(m => m.id === state.settings.model)?.name || state.settings.model,
      timestamp: Date.now(),
    };

    state.messages.push(userMsg);
    state.conversations = state.conversations.map(c => {
      if (c.id === convId) { c.messageCount = state.messages.length / 2; return c; }
      return c;
    });
    saveMessages(convId, state.messages);
    saveConversations();

    renderMessage(userMsg, true);
    DOM.chatInput.value = '';
    updateCharCount();
    renderHistory();

    state.isProcessing = true;
    DOM.chatSend.disabled = true;
    setStatus('Thinking...', 'loading');
    addTypingIndicator();

    try {
      let response;
      if (state.settings.model === 'demo') {
        response = await simulateResponse(text);
      } else if (state.settings.model.startsWith('gpt')) {
        response = await callOpenAI(text);
      } else if (state.settings.model.startsWith('claude')) {
        response = await callAnthropic(text);
      } else {
        response = await simulateResponse(text);
      }

      removeTypingIndicator();

      const assistantMsg = {
        id: `msg_${Date.now()}_resp`,
        role: 'assistant',
        content: response,
        model: state.settings.model,
        modelName: MODELS.find(m => m.id === state.settings.model)?.name || 'Assistant',
        timestamp: Date.now(),
      };

      state.messages.push(assistantMsg);
      saveMessages(convId, state.messages);
      renderMessage(assistantMsg, true);
      setStatus('', '');
    } catch (err) {
      removeTypingIndicator();
      setStatus(`Error: ${err.message}`, 'error');
    }

    state.isProcessing = false;
    DOM.chatSend.disabled = false;
    DOM.chatInput.focus();
  }

  function simulateResponse(text) {
    return new Promise(resolve => {
      const delay = 400 + Math.random() * 1200;
      setTimeout(() => {
        const responses = [
          `That's an interesting question about "${text.slice(0,50)}". Here's what I think:\n\nThis is a simulated response from the Demo Mode. To get real AI responses, connect your API key in Settings and select a model like GPT-4 or Claude.`,
          `I understand you're asking about "${text.slice(0,60)}". Great topic!\n\nRemember: Demo Mode provides simulated responses. For production use, please configure your API keys in the Settings section.`,
          `Thanks for your message! In Demo Mode, I generate sample responses so you can test the interface.\n\nTo enable real AI responses:\n1. Go to Settings\n2. Enter your OpenAI or Anthropic API key\n3. Select a model\n4. Start chatting!`,
        ];
        resolve(responses[Math.floor(Math.random() * responses.length)]);
      }, delay);
    });
  }

  async function callOpenAI(text) {
    const apiKey = state.settings.apiKeyOpenAI;
    if (!apiKey) throw new Error('OpenAI API key not configured. Add it in Settings.');

    const modelMap = { 'gpt-4-turbo': 'gpt-4-turbo', 'gpt-4': 'gpt-4', 'gpt-3.5-turbo': 'gpt-3.5-turbo' };
    const apiModel = modelMap[state.settings.model] || 'gpt-4-turbo';

    const systemMsg = { role: 'system', content: state.settings.systemPrompt };
    const historyMsgs = state.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));
    const body = {
      model: apiModel,
      messages: [systemMsg, ...historyMsgs],
      temperature: state.settings.temperature,
      max_tokens: state.settings.maxTokens,
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || 'No response';
  }

  async function callAnthropic(text) {
    const apiKey = state.settings.apiKeyAnthropic;
    if (!apiKey) throw new Error('Anthropic API key not configured. Add it in Settings.');

    const modelMap = { 'claude-3-opus': 'claude-3-opus-20240229', 'claude-3-sonnet': 'claude-3-sonnet-20240229' };
    const apiModel = modelMap[state.settings.model] || 'claude-3-sonnet-20240229';

    const historyMsgs = state.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    const body = {
      model: apiModel,
      max_tokens: state.settings.maxTokens,
      system: state.settings.systemPrompt,
      messages: historyMsgs,
      temperature: state.settings.temperature,
    };

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || 'No response';
  }

  function setStatus(text, type) {
    DOM.chatStatus.textContent = text;
    DOM.chatStatus.className = 'chat-status' + (type ? ` ${type}` : '');
  }

  // Chat History View
  function renderHistory() {
    if (!DOM.historyList) return;
    if (!state.conversations.length) {
      DOM.historyList.innerHTML = `
        <div class="history-empty">
          <span class="history-empty-icon">💬</span>
          <p>No saved conversations yet</p>
          <p class="history-empty-sub">Start a chat and your conversations will appear here</p>
        </div>
      `;
      return;
    }

    DOM.historyList.innerHTML = state.conversations.map(c => `
      <div class="history-item" data-id="${c.id}">
        <div class="history-item-info">
          <div class="history-item-title">${c.name}</div>
          <div class="history-item-meta">${Math.round(c.messageCount || 0)} messages · ${new Date(c.createdAt).toLocaleDateString()} · ${c.model}</div>
        </div>
        <div class="history-item-actions">
          <button class="history-btn load-btn" data-id="${c.id}">Load</button>
          <button class="history-btn danger delete-btn" data-id="${c.id}">Delete</button>
        </div>
      </div>
    `).join('');

    DOM.historyList.addEventListener('click', e => {
      const loadBtn = e.target.closest('.load-btn');
      const delBtn = e.target.closest('.delete-btn');
      if (loadBtn) loadConversation(loadBtn.dataset.id);
      if (delBtn) deleteConversation(delBtn.dataset.id);
    });
  }

  function loadConversation(id) {
    const conv = state.conversations.find(c => c.id === id);
    if (!conv) return;
    state.currentConversationId = id;
    state.messages = loadMessages(id);
    state.settings.model = conv.model;

    DOM.chatMessages.innerHTML = '';
    if (!state.messages.length) {
      DOM.chatMessages.innerHTML = `
        <div class="message welcome-msg">
          <div class="msg-avatar demo-avatar">AI</div>
          <div class="msg-content">
            <div class="msg-author">AEL Assistant</div>
            <div class="msg-text">Loaded conversation "${conv.name}". Continue chatting below.</div>
          </div>
        </div>
      `;
    } else {
      state.messages.forEach(m => renderMessage(m));
    }

    DOM.chatModelSelect.value = conv.model;
    state.settings.model = conv.model;

    // Switch to chat tab
    document.querySelector('.nav-link[href="#chat"]')?.click();
    setStatus(`Loaded: ${conv.name}`, 'success');
    setTimeout(() => setStatus('', ''), 2000);
  }

  function deleteConversation(id) {
    if (!confirm('Delete this conversation?')) return;
    state.conversations = state.conversations.filter(c => c.id !== id);
    localStorage.removeItem(`${STORAGE_KEYS.messages}_${id}`);
    if (state.currentConversationId === id) {
      state.currentConversationId = null;
      state.messages = [];
      DOM.chatMessages.innerHTML = `
        <div class="message welcome-msg">
          <div class="msg-avatar demo-avatar">AI</div>
          <div class="msg-content">
            <div class="msg-author">AEL Assistant</div>
            <div class="msg-text">Conversation deleted. Start a new chat!</div>
          </div>
        </div>
      `;
    }
    saveConversations();
    renderHistory();
  }

  // Settings UI
  function populateSettings() {
    DOM.settingModel.value = state.settings.model;
    DOM.settingTemp.value = state.settings.temperature;
    DOM.tempValue.textContent = state.settings.temperature;
    DOM.settingTokens.value = state.settings.maxTokens;
    DOM.tokensValue.textContent = state.settings.maxTokens;
    DOM.settingSystemPrompt.value = state.settings.systemPrompt;
    DOM.apiKeyOpenAI.value = state.settings.apiKeyOpenAI || '';
    DOM.apiKeyAnthropic.value = state.settings.apiKeyAnthropic || '';
    DOM.chatModelSelect.value = state.settings.model;
  }

  // Chat Export
  function exportChat() {
    if (!state.messages.length) {
      setStatus('No messages to export', 'error');
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      model: state.settings.model,
      messages: state.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ael-chat-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('Chat exported successfully', 'success');
    setTimeout(() => setStatus('', ''), 2000);
  }

  // Update Stats
  function updateStats() {
    const convCount = state.conversations.length;
    let msgCount = 0;
    state.conversations.forEach(c => {
      const msgs = loadMessages(c.id);
      msgCount += msgs.length;
    });
    if (DOM.statConversations) DOM.statConversations.textContent = convCount;
    if (DOM.statMessages) DOM.statMessages.textContent = msgCount;
  }

  // Init
  function init() {
    cacheDOM();
    initNavigation();
    renderModels();
    renderHistory();
    populateSettings();
    updateStats();

    // Chat events
    DOM.chatInput.addEventListener('input', updateCharCount);
    DOM.chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    DOM.chatSend.addEventListener('click', handleSend);

    DOM.chatClear.addEventListener('click', () => {
      if (!state.messages.length) return;
      if (!confirm('Clear current conversation?')) return;
      state.messages = [];
      DOM.chatMessages.innerHTML = `
        <div class="message welcome-msg">
          <div class="msg-avatar demo-avatar">AI</div>
          <div class="msg-content">
            <div class="msg-author">AEL Assistant</div>
            <div class="msg-text">Chat cleared. Start a new conversation!</div>
          </div>
        </div>
      `;
      if (state.currentConversationId) {
        saveMessages(state.currentConversationId, []);
        const conv = state.conversations.find(c => c.id === state.currentConversationId);
        if (conv) conv.messageCount = 0;
        saveConversations();
      }
      setStatus('Chat cleared', 'success');
      setTimeout(() => setStatus('', ''), 1500);
    });

    DOM.chatExport.addEventListener('click', exportChat);

    // Settings events
    DOM.settingTemp.addEventListener('input', () => {
      DOM.tempValue.textContent = DOM.settingTemp.value;
      state.settings.temperature = parseFloat(DOM.settingTemp.value);
    });

    DOM.settingTokens.addEventListener('input', () => {
      DOM.tokensValue.textContent = DOM.settingTokens.value;
      state.settings.maxTokens = parseInt(DOM.settingTokens.value);
    });

    DOM.settingModel.addEventListener('change', () => {
      state.settings.model = DOM.settingModel.value;
      DOM.chatModelSelect.value = state.settings.model;
    });

    DOM.chatModelSelect.addEventListener('change', () => {
      state.settings.model = DOM.chatModelSelect.value;
      DOM.settingModel.value = state.settings.model;
    });

    DOM.settingsSave.addEventListener('click', () => {
      state.settings.apiKeyOpenAI = DOM.apiKeyOpenAI.value.trim();
      state.settings.apiKeyAnthropic = DOM.apiKeyAnthropic.value.trim();
      state.settings.model = DOM.settingModel.value;
      state.settings.temperature = parseFloat(DOM.settingTemp.value);
      state.settings.maxTokens = parseInt(DOM.settingTokens.value);
      state.settings.systemPrompt = DOM.settingSystemPrompt.value.trim() || state.settings.systemPrompt;
      saveSettings();
      DOM.chatModelSelect.value = state.settings.model;
      setStatus('Settings saved successfully', 'success');
      setTimeout(() => setStatus('', ''), 2000);
    });

    DOM.settingsClear.addEventListener('click', () => {
      if (!confirm('This will clear ALL settings and conversations. Continue?')) return;
      localStorage.clear();
      state.settings = loadSettings();
      state.conversations = [];
      state.messages = [];
      state.currentConversationId = null;
      populateSettings();
      renderHistory();
      DOM.chatMessages.innerHTML = `
        <div class="message welcome-msg">
          <div class="msg-avatar demo-avatar">AI</div>
          <div class="msg-content">
            <div class="msg-author">AEL Assistant</div>
            <div class="msg-text">All data cleared. Welcome back!</div>
          </div>
        </div>
      `;
      updateStats();
      setStatus('All data cleared', 'success');
      setTimeout(() => setStatus('', ''), 2000);
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.settingSystemPrompt.value = btn.dataset.prompt;
      });
    });

    // History events
    DOM.historyRefresh.addEventListener('click', renderHistory);
    DOM.historyClearAll.addEventListener('click', () => {
      if (!confirm('Delete ALL conversations?')) return;
      state.conversations.forEach(c => {
        localStorage.removeItem(`${STORAGE_KEYS.messages}_${c.id}`);
      });
      state.conversations = [];
      state.currentConversationId = null;
      state.messages = [];
      saveConversations();
      renderHistory();
      DOM.chatMessages.innerHTML = `
        <div class="message welcome-msg">
          <div class="msg-avatar demo-avatar">AI</div>
          <div class="msg-content">
            <div class="msg-author">AEL Assistant</div>
            <div class="msg-text">All conversations cleared. Start a new chat!</div>
          </div>
        </div>
      `;
      updateStats();
    });

    // Toggle API key visibility
    document.getElementById('toggleOpenAI')?.addEventListener('click', () => {
      const input = DOM.apiKeyOpenAI;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
    document.getElementById('toggleAnthropic')?.addEventListener('click', () => {
      const input = DOM.apiKeyAnthropic;
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Cursor glow
    document.addEventListener('mousemove', e => {
      DOM.cursorGlow.style.opacity = '1';
      DOM.cursorGlow.style.left = e.clientX + 'px';
      DOM.cursorGlow.style.top = e.clientY + 'px';
    });
    document.addEventListener('mouseleave', () => { DOM.cursorGlow.style.opacity = '0'; });

    // Mobile nav toggle
    DOM.navToggle.addEventListener('click', () => {
      DOM.navLinks.classList.toggle('open');
    });

    // Navbar scroll
    window.addEventListener('scroll', () => {
      DOM.navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Initial render
    populateSettings();
    updateCharCount();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
