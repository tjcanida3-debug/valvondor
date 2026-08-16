
(function(){
  const toggle = document.getElementById('globalChatToggle');
  const panel = document.getElementById('globalChatPanel');
  const closeBtn = document.getElementById('chatCloseBtn');
  const minBtn = document.getElementById('chatMinimizeBtn');
  const clearBtn = document.getElementById('chatClearLocalBtn');
  const messages = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const userLabel = document.getElementById('chatUserLabel');
  const connection = document.getElementById('chatConnectionState');
  const cooldownLabel = document.getElementById('chatCooldownLabel');

  if(!toggle || !panel) return;

  let currentUser = null;
  let lastSendAt = 0;
  const COOLDOWN_MS = 1500;
  const localHistory = [];

  function timeString(d=new Date()){
    return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  function escapeText(value){
    const div=document.createElement('div');
    div.textContent=String(value ?? '');
    return div.innerHTML;
  }

  function renderLine({username='System', message='', system=false, self=false, created_at=null}){
    const line=document.createElement('div');
    line.className='chatLine'+(system?' system':'')+(self?' self':'');
    line.innerHTML =
      `<span class="time">${escapeText(created_at?timeString(new Date(created_at)):timeString())}</span>`+
      `<span class="user">${escapeText(username)}:</span>`+
      `<span class="message">${escapeText(message)}</span>`;
    messages.appendChild(line);
    messages.scrollTop=messages.scrollHeight;
    if(!panel.classList.contains('open')) toggle.classList.add('hasUnread');
  }

  function systemMessage(message){
    renderLine({username:'Valvondor',message,system:true});
  }

  function openChat(){
    panel.classList.add('open');
    panel.classList.remove('minimized');
    panel.setAttribute('aria-hidden','false');
    toggle.setAttribute('aria-expanded','true');
    toggle.classList.remove('hasUnread');
    if(!input.disabled) setTimeout(()=>input.focus(),0);
  }
  function closeChat(){
    panel.classList.remove('open','minimized');
    panel.setAttribute('aria-hidden','true');
    toggle.setAttribute('aria-expanded','false');
  }
  function minimizeChat(){
    panel.classList.add('open');
    panel.classList.toggle('minimized');
  }

  function setUser(user){
    currentUser=user||null;
    const name=currentUser?.username || currentUser?.email || 'Not signed in';
    userLabel.textContent=name;
    input.disabled=!currentUser;
    sendBtn.disabled=!currentUser;
    input.placeholder=currentUser?'Message Global Chat...':'Log in to chat...';
  }

  function setConnection(label, online=false){
    connection.textContent=label;
    connection.style.color=online?'#9ec08f':'#958a77';
  }

  async function send(){
    if(!currentUser || input.disabled) return;
    const message=(input.value||'').trim();
    if(!message) return;
    if(message.length>240){
      systemMessage('Message is too long.');
      return;
    }
    const now=Date.now();
    const wait=COOLDOWN_MS-(now-lastSendAt);
    if(wait>0){
      cooldownLabel.textContent=`Slow down · ${Math.ceil(wait/1000)}s`;
      return;
    }
    lastSendAt=now;
    cooldownLabel.textContent='Global · 240 chars max';

    // Supabase adapter hook. Until connected, keep a local preview so UI can be tested.
    if(window.ValvondorChatBackend?.send){
      try{
        sendBtn.disabled=true;
        await window.ValvondorChatBackend.send(message);
        input.value='';
      }catch(err){
        systemMessage('Message failed to send.');
      }finally{
        sendBtn.disabled=false;
      }
      return;
    }

    const entry={
      username:currentUser.username||'Player',
      message,
      self:true,
      created_at:new Date().toISOString()
    };
    localHistory.push(entry);
    renderLine(entry);
    input.value='';
  }

  toggle.addEventListener('click',()=>panel.classList.contains('open')?closeChat():openChat());
  closeBtn?.addEventListener('click',closeChat);
  minBtn?.addEventListener('click',minimizeChat);
  clearBtn?.addEventListener('click',()=>{messages.innerHTML='';localHistory.length=0;systemMessage('Local preview cleared.')});
  sendBtn?.addEventListener('click',send);
  input?.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}
  });

  systemMessage('Global Chat UI ready. Live chat will connect through Supabase.');
  setConnection('Offline preview',false);
  setUser(null);

  // Public bridge for auth + Supabase realtime layer.
  window.ValvondorChatUI={
    setUser,
    setConnection,
    addMessage(data){
      const self=!!currentUser && (data.user_id===currentUser.id || data.username===currentUser.username);
      renderLine({...data,self});
    },
    systemMessage,
    open:openChat,
    close:closeChat
  };
})();
