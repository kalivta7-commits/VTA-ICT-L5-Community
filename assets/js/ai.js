document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const quickButtons = document.querySelectorAll('.quick-btn');

  // API endpoint
  const API_URL = '/.netlify/functions/ai';

  // Initial greeting
  addMessage('ai', 'Hi, I\'m EJ.Ai 👋\nYour AI study assistant 🤖\n\nAsk me anything about ICT 💻, programming 🧑‍💻, databases 🗄️, networking 🌐, or your study materials 📚.');

  // Quick action buttons – insert prompt text
  const prompts = {
    explain: 'Explain code:\nPaste your code here →',
    fix: 'Fix programming error:\nPaste your code and error here →',
    summarize: 'Summarize notes:\nPaste your text or notes →',
    roadmap: 'Learning roadmap:\nWhat topic do you want to learn?'
  };

  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.prompt;
      if (prompts[key]) {
        messageInput.value = prompts[key];
        messageInput.focus();
        // Place cursor at the end
        messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
      }
    });
  });

  // Send message on button click
  sendButton.addEventListener('click', sendMessage);

  // Send message on Enter (but allow newline? We use simple input, so Enter sends)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // Clear input
    messageInput.value = '';

    // Add user message
    addMessage('user', text);

    // Scroll to bottom
    scrollToBottom();

    // Show loading indicator
    const loadingId = addLoadingMessage();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      // Remove loading indicator
      removeLoadingMessage(loadingId);

      // Add AI response (assuming data.reply or similar – adjust to your backend response)
      const reply = data.reply || data.message || data.response || 'No response from AI';
      addMessage('ai', reply);
    } catch (error) {
      console.error('Chat error:', error);
      removeLoadingMessage(loadingId);
      addMessage('error', '⚠ Sorry, I encountered an error. Please try again later.');
    }

    scrollToBottom();
  }

  function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    // Use innerText to preserve line breaks, but also allow simple HTML? We'll use textContent for safety.
    bubble.textContent = content;

    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    return messageDiv; // optional
  }

  function addLoadingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai loading';
    messageDiv.id = 'loading-' + Date.now();

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = 'Thinking';

    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv.id;
  }

  function removeLoadingMessage(id) {
    const loadingMsg = document.getElementById(id);
    if (loadingMsg) loadingMsg.remove();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});