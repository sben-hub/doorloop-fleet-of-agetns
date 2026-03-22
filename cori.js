// CORI — DoorLoop AI Assistant (floating bubble)
(function() {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .cori-bubble { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }
    .cori-btn { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(102,126,234,0.4); transition: all 0.3s; }
    .cori-btn:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(102,126,234,0.5); }
    .cori-btn .cori-icon { color: white; font-size: 22px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .cori-btn .cori-close { display: none; color: white; font-size: 20px; }
    .cori-btn.open .cori-icon { display: none; }
    .cori-btn.open .cori-close { display: block; }
    .cori-label { position: absolute; bottom: 64px; right: 0; background: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #1a2b4a; box-shadow: 0 2px 12px rgba(0,0,0,0.1); white-space: nowrap; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
    .cori-bubble:hover .cori-label { opacity: 1; }
    .cori-bubble.chat-open .cori-label { display: none; }

    .cori-chat { position: fixed; bottom: 92px; right: 24px; width: 380px; height: 520px; background: white; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); display: none; flex-direction: column; z-index: 9998; overflow: hidden; animation: coriSlideUp 0.3s ease; }
    .cori-bubble.chat-open .cori-chat { display: flex; }
    @keyframes coriSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .cori-chat-header { padding: 16px 18px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .cori-chat-header .cori-avatar { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .cori-chat-header .cori-header-info h4 { font-size: 14px; font-weight: 600; }
    .cori-chat-header .cori-header-info p { font-size: 11px; opacity: 0.8; }

    .cori-chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f8f9fc; }

    .cori-msg { display: flex; gap: 8px; max-width: 90%; animation: coriFadeIn 0.3s ease; }
    .cori-msg.ai { align-self: flex-start; }
    .cori-msg.user { align-self: flex-end; flex-direction: row-reverse; }
    .cori-msg .cori-msg-avatar { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .cori-msg.ai .cori-msg-avatar { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
    .cori-msg.user .cori-msg-avatar { background: #4C6FFF; color: white; }
    .cori-msg .cori-msg-text { padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
    .cori-msg.ai .cori-msg-text { background: white; border: 1px solid #e8ecf1; border-top-left-radius: 4px; }
    .cori-msg.user .cori-msg-text { background: #4C6FFF; color: white; border-top-right-radius: 4px; }
    @keyframes coriFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .cori-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .cori-suggestions button { padding: 6px 12px; border: 1px solid #e8ecf1; border-radius: 8px; background: white; font-size: 11px; cursor: pointer; color: #1a2b4a; transition: all 0.15s; }
    .cori-suggestions button:hover { border-color: #667eea; color: #667eea; background: #f5f3ff; }

    .cori-chat-input { padding: 12px 14px; border-top: 1px solid #e8ecf1; display: flex; gap: 8px; align-items: flex-end; background: white; flex-shrink: 0; }
    .cori-chat-input textarea { flex: 1; border: 1px solid #e8ecf1; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-family: inherit; resize: none; min-height: 18px; max-height: 80px; line-height: 1.4; }
    .cori-chat-input textarea:focus { outline: none; border-color: #667eea; }
    .cori-chat-input .cori-send { width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cori-chat-input .cori-send:hover { opacity: 0.9; }

    .cori-typing { display: flex; gap: 3px; padding: 4px 0; }
    .cori-typing span { width: 5px; height: 5px; background: #667eea; border-radius: 50%; animation: coriTyping 1.4s infinite; }
    .cori-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cori-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes coriTyping { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }
  `;
  document.head.appendChild(style);

  // Detect current page for context-aware suggestions
  const page = window.location.pathname.split('/').pop() || '';
  let suggestions = [];
  let welcomeMsg = '';

  if (page.includes('maintenance-agent') || page === '') {
    welcomeMsg = "I'm <strong>CORI</strong>, your AI assistant. I can help you set up and manage your agents. What would you like to know?";
    suggestions = [
      { text: "What agents can I set up?", response: "You can set up 6 agent types: <strong>Maintenance</strong> (handles repairs end-to-end), <strong>Renewal</strong> (automates lease renewals), <strong>Move-in</strong> (tenant onboarding), <strong>Move-out</strong> (inspections & turnover), <strong>Leasing</strong> (prospect to signed lease), and <strong>Delinquency</strong> (rent collection). The Maintenance agent is ready now — the others are coming soon!" },
      { text: "How does the maintenance agent work?", response: "The Maintenance Agent handles the full repair lifecycle:<br><br>1. Tenant submits a request<br>2. Agent triages severity & category<br>3. Creates a work order<br>4. Selects and contacts a vendor<br>5. Gets owner approval if needed<br>6. Schedules the repair<br>7. Follows up to verify resolution<br>8. Closes and sends the invoice<br><br>You can configure every step — thresholds, vendor preferences, SLAs, and more." },
      { text: "What happens if the agent gets stuck?", response: "If the agent encounters a situation it hasn't been configured for, it <strong>pauses and asks you</strong> right here. You decide what to do, and the agent asks if you want that to be a permanent rule or a one-time decision. Over time, it learns and escalates less." },
    ];
  } else if (page.includes('communication')) {
    welcomeMsg = "I'm <strong>CORI</strong>. I can help you understand what's happening in your conversations. Ask me about any tenant, work order, or agent activity.";
    suggestions = [
      { text: "What's the status of Sarah's request?", response: "Sarah Thompson's leak at Unit 4B is <strong>almost resolved</strong>. The plumber (Mike's Plumbing) visited yesterday. The agent sent a follow-up asking if the fix worked — we're waiting for her response. If she confirms, the work order will close and a $350 invoice goes to the owner." },
      { text: "Which conversations need my attention?", response: "Right now you have <strong>3 conversations</strong> that may need attention:<br><br>1. <strong>Sarah Thompson</strong> — waiting for verification reply (agent handling)<br>2. <strong>David Kim</strong> — asked about lease renewal, no agent assigned yet<br>3. <strong>Rachel Brown</strong> — HVAC repair scheduled for Thursday<br><br>David's question isn't covered by an active agent. Want me to reply to him?" },
      { text: "Take over Sarah's conversation", response: "To take over from the agent, click the <strong>'Take over from agent'</strong> button in the conversation header. The agent will pause and you'll have full control. You can return it to the agent anytime." },
    ];
  } else if (page.includes('audit')) {
    welcomeMsg = "I'm <strong>CORI</strong>. I can help you understand the audit log — find specific actions, explain agent decisions, or spot patterns.";
    suggestions = [
      { text: "Why did the agent pick Mike's Plumbing?", response: "For WO #4521, the agent selected <strong>Mike's Plumbing</strong> because:<br><br>1. They're on your <strong>preferred vendor list</strong><br>2. Category match: <strong>Plumbing</strong><br>3. Rating: <strong>4.8★</strong> (highest among plumbing vendors)<br>4. Distance: <strong>2.1 miles</strong> from the property<br>5. They had availability the next day<br><br>The selection followed your configured rule: 'Preferred vendors first, then auto-select by rating.'" },
      { text: "Show me all escalations this week", response: "There was <strong>1 escalation</strong> this week:<br><br><strong>Mar 19, 2:45 PM</strong> — Robert Chen at Unit 5A reported mold in the bathroom. The agent flagged it because mold remediation involves health/safety regulations outside its configured scope. You were notified and handled it manually.<br><br>Tip: You could add a mold remediation rule to reduce future escalations." },
      { text: "How many messages did the agent send?", response: "This week, your agents sent <strong>34 messages</strong>:<br><br>• 18 to tenants (acknowledgments, scheduling, follow-ups)<br>• 11 to vendors (estimate requests, confirmations)<br>• 5 to owners (approvals, invoices)<br><br>That's roughly <strong>2.5 hours of PM time saved</strong> based on average message handling time." },
    ];
  } else if (page.includes('command')) {
    welcomeMsg = "I'm <strong>CORI</strong>. I can help you understand your agent performance, spot trends, and optimize your setup.";
    suggestions = [
      { text: "How are my agents performing?", response: "Here's your weekly summary:<br><br>• <strong>78% automation rate</strong> — most workflows complete without you<br>• <strong>1.8 day avg resolution</strong> — down from 3.2 days before agents<br>• <strong>12% escalation rate</strong> — trending down (was 18% last week)<br>• <strong>$4,200 estimated savings</strong> this month in PM hours<br><br>Your Maintenance agent is your strongest performer. Consider setting up the Move-in agent next — it has the highest ROI potential." },
      { text: "Which agent should I set up next?", response: "Based on your portfolio, I'd recommend the <strong>Delinquency Agent</strong> next. Here's why:<br><br>• You have <strong>8 tenants</strong> with outstanding balances<br>• Manual follow-up is taking ~3 hours/week<br>• Automated reminders typically improve collection rates by <strong>15-20%</strong><br><br>After that, the <strong>Renewal Agent</strong> would be valuable — you have 12 leases expiring in the next 90 days." },
      { text: "Why is the escalation rate 12%?", response: "Your 12% escalation rate breaks down as:<br><br>• <strong>5 escalations</strong> out of 42 workflows this week<br>• 2 were mold/health-safety (outside agent scope)<br>• 2 were vendor cancellations (no fallback rule)<br>• 1 was an unusual tenant request<br><br>You can reduce this by adding rules for:<br>1. Mold remediation handling<br>2. Vendor cancellation fallback (auto-assign next vendor)<br><br>That would drop escalations to ~5%." },
    ];
  }

  // Build DOM
  const bubble = document.createElement('div');
  bubble.className = 'cori-bubble';
  bubble.innerHTML = `
    <div class="cori-label">Ask CORI anything</div>
    <div class="cori-chat">
      <div class="cori-chat-header">
        <div class="cori-avatar">C</div>
        <div class="cori-header-info">
          <h4>CORI</h4>
          <p>DoorLoop AI Assistant</p>
        </div>
      </div>
      <div class="cori-chat-body" id="coriBody">
        <div class="cori-msg ai">
          <div class="cori-msg-avatar">C</div>
          <div class="cori-msg-text">
            ${welcomeMsg}
            <div class="cori-suggestions" style="margin-top:10px;">
              ${suggestions.map((s, i) => `<button onclick="coriSuggest(${i})">${s.text}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="cori-chat-input">
        <textarea id="coriInput" rows="1" placeholder="Ask CORI..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();coriSend()}"></textarea>
        <button class="cori-send" onclick="coriSend()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
    <button class="cori-btn" onclick="coriToggle()">
      <span class="cori-icon">C</span>
      <span class="cori-close">✕</span>
    </button>
  `;
  document.body.appendChild(bubble);

  // Store suggestions globally for onclick
  window._coriSuggestions = suggestions;

  window.coriToggle = function() {
    bubble.classList.toggle('chat-open');
    bubble.querySelector('.cori-btn').classList.toggle('open');
  };

  window.coriSuggest = function(index) {
    const s = window._coriSuggestions[index];
    if (!s) return;
    const body = document.getElementById('coriBody');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'cori-msg user';
    userMsg.innerHTML = `<div class="cori-msg-avatar">S</div><div class="cori-msg-text">${s.text}</div>`;
    body.appendChild(userMsg);

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'cori-msg ai';
    typing.innerHTML = `<div class="cori-msg-avatar">C</div><div class="cori-msg-text"><div class="cori-typing"><span></span><span></span><span></span></div></div>`;
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const aiMsg = document.createElement('div');
      aiMsg.className = 'cori-msg ai';
      aiMsg.innerHTML = `<div class="cori-msg-avatar">C</div><div class="cori-msg-text">${s.response}</div>`;
      body.appendChild(aiMsg);
      body.scrollTop = body.scrollHeight;
    }, 1200);
  };

  window.coriSend = function() {
    const input = document.getElementById('coriInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const body = document.getElementById('coriBody');

    const userMsg = document.createElement('div');
    userMsg.className = 'cori-msg user';
    userMsg.innerHTML = `<div class="cori-msg-avatar">S</div><div class="cori-msg-text">${text}</div>`;
    body.appendChild(userMsg);

    const typing = document.createElement('div');
    typing.className = 'cori-msg ai';
    typing.innerHTML = `<div class="cori-msg-avatar">C</div><div class="cori-msg-text"><div class="cori-typing"><span></span><span></span><span></span></div></div>`;
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const aiMsg = document.createElement('div');
      aiMsg.className = 'cori-msg ai';
      aiMsg.innerHTML = `<div class="cori-msg-avatar">C</div><div class="cori-msg-text">I understand your question about "${text}". In the full version, I'd search across your agents, workflows, and property data to give you a precise answer. For this demo, try clicking one of my suggested questions!</div>`;
      body.appendChild(aiMsg);
      body.scrollTop = body.scrollHeight;
    }, 1500);
  };
})();
