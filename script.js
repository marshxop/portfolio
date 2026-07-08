// ===================== STOPIDS chat =====================
// Peer-to-peer chat using PeerJS + WebRTC. No server, no database.
// A "room" only exists while the host's tab stays open — that's the "temporary ID".

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- glitch logo ----------
const logo = document.getElementById('glitchLogo');
const words = ['STOPIDS', 'STUPIDS'];
let wIndex = 0;
if (!reduceMotion) {
  setInterval(() => {
    logo.classList.add('glitching');
    setTimeout(() => {
      wIndex = 1 - wIndex;
      logo.textContent = words[wIndex];
      logo.setAttribute('data-text', words[1 - wIndex]);
    }, 120);
    setTimeout(() => logo.classList.remove('glitching'), 350);
  }, 4200);
}

// ---------- elements ----------
const gate = document.getElementById('gate');
const gateStatus = document.getElementById('gateStatus');
const nameInput = document.getElementById('nameInput');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const tabBtns = document.querySelectorAll('.tab-btn');
const createPanel = document.getElementById('createPanel');
const joinPanel = document.getElementById('joinPanel');

const chatShell = document.getElementById('chatShell');
const memberList = document.getElementById('memberList');
const chatLog = document.getElementById('chatLog');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const leaveBtn = document.getElementById('leaveBtn');
const termPath = document.getElementById('termPath');

// ---------- default silly name ----------
const adjectives = ['chaotic','feral','unhinged','certified','tragic','legendary','confused','gremlin','professional'];
const nouns = ['potato','raccoon','menace','disaster','wizard','nugget','cryptid','himbo','goblin'];
function randomName(){
  return adjectives[Math.floor(Math.random()*adjectives.length)] + '_' +
         nouns[Math.floor(Math.random()*nouns.length)] + '_' +
         Math.floor(Math.random()*90+10);
}
nameInput.value = randomName();

// ---------- tabs ----------
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    createPanel.classList.toggle('hidden', tab !== 'create');
    joinPanel.classList.toggle('hidden', tab !== 'join');
    setStatus('');
  });
});

function setStatus(text, isError){
  gateStatus.textContent = text || '';
  gateStatus.classList.toggle('error', !!isError);
}

// ---------- state ----------
let peer = null;
let isHost = false;
let myName = '';
let roomCode = '';
const connections = new Map();   // peerId -> DataConnection (host only)
const connNames = new Map();     // peerId -> name (host only)
let hostConn = null;             // guest's connection to the host

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
function generateCode(){
  let code = '';
  for(let i=0;i<5;i++) code += CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)];
  return code;
}

// ---------- UI transitions ----------
function enterChatUI(){
  gate.classList.add('hidden');
  chatShell.classList.remove('hidden');
  roomCodeDisplay.textContent = roomCode;
  termPath.textContent = 'stopids://room/' + roomCode;
  msgInput.focus();
}

function addMessage(who, text, kind){
  const row = document.createElement('div');
  row.className = 'msg ' + kind;
  const whoSpan = document.createElement('span');
  whoSpan.className = 'who';
  whoSpan.textContent = kind === 'system' ? '' : who + ':';
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  row.appendChild(whoSpan);
  row.appendChild(textSpan);
  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderMembers(names){
  memberList.innerHTML = '';
  names.forEach(n => {
    const el = document.createElement('div');
    el.className = 'member';
    el.innerHTML = '<span class="dot"></span>' + n + (n === myName ? ' (you)' : '');
    memberList.appendChild(el);
  });
}

// ---------- host logic ----------
function createRoom(attemptsLeft){
  attemptsLeft = attemptsLeft === undefined ? 5 : attemptsLeft;
  if(attemptsLeft <= 0){
    setStatus('could not generate a free room ID, try again', true);
    createBtn.disabled = false;
    return;
  }
  myName = (nameInput.value.trim() || randomName()).slice(0,20);
  const code = generateCode();
  setStatus('creating room ' + code + ' ...');
  createBtn.disabled = true;

  const p = new Peer(code, { debug: 0 });

  p.on('open', (id) => {
    peer = p;
    isHost = true;
    roomCode = id;
    createBtn.disabled = false;
    addMessage('', 'welcome to #general. lower your IQ before entering. rules are in the footer (nobody reads them).', 'system');
    enterChatUI();
    renderMembers([myName]);

    peer.on('connection', (conn) => setupHostConnection(conn));
  });

  p.on('error', (err) => {
    if(err && err.type === 'unavailable-id'){
      p.destroy();
      createRoom(attemptsLeft - 1);
    } else {
      createBtn.disabled = false;
      setStatus('connection error: ' + (err && err.type ? err.type : 'unknown') + '. check your network and try again.', true);
    }
  });
}

function setupHostConnection(conn){
  conn.on('open', () => {
    connections.set(conn.peer, conn);
  });
  conn.on('data', (data) => hostHandleData(conn, data));
  conn.on('close', () => {
    const name = connNames.get(conn.peer) || 'someone';
    connections.delete(conn.peer);
    connNames.delete(conn.peer);
    broadcastSystem(name + ' left the room');
    broadcastPresence();
  });
  conn.on('error', () => {
    connections.delete(conn.peer);
    connNames.delete(conn.peer);
    broadcastPresence();
  });
}

function hostHandleData(conn, data){
  if(!data || typeof data !== 'object') return;

  if(data.type === 'join'){
    const name = (data.name || 'friend').slice(0,20);
    connNames.set(conn.peer, name);
    broadcastSystem(name + ' joined the room');
    broadcastPresence();
  } else if(data.type === 'chat'){
    const name = connNames.get(conn.peer) || 'friend';
    addMessage(name, data.text, 'friend');
    relayExcept(conn, { type:'chat', name: name, text: data.text });
  }
}

function relayExcept(senderConn, payload){
  connections.forEach((c) => {
    if(c !== senderConn){
      try{ c.send(payload); }catch(e){}
    }
  });
}

function broadcastSystem(text){
  connections.forEach((c) => { try{ c.send({ type:'system', text }); }catch(e){} });
  addMessage('', text, 'system');
}

function broadcastPresence(){
  const members = [myName, ...connNames.values()];
  connections.forEach((c) => { try{ c.send({ type:'presence', members }); }catch(e){} });
  renderMembers(members);
}

// ---------- guest logic ----------
function joinRoom(){
  const code = (codeInput.value.trim() || '').toUpperCase();
  if(!code){
    setStatus('enter a room ID first', true);
    return;
  }
  myName = (nameInput.value.trim() || randomName()).slice(0,20);
  setStatus('connecting to ' + code + ' ...');
  joinBtn.disabled = true;

  const p = new Peer(undefined, { debug: 0 });

  p.on('open', () => {
    peer = p;
    isHost = false;
    roomCode = code;
    const conn = p.connect(code, { metadata: { name: myName }, reliable: true });
    hostConn = conn;

    conn.on('open', () => {
      joinBtn.disabled = false;
      conn.send({ type:'join', name: myName });
      addMessage('', 'connected to room ' + code, 'system');
      enterChatUI();
      renderMembers([myName]);
    });

    conn.on('data', (data) => guestHandleData(data));

    conn.on('close', () => {
      addMessage('', 'disconnected from the host — refresh to reconnect', 'system');
    });

    conn.on('error', () => {
      joinBtn.disabled = false;
      setStatus('could not reach that room. check the ID and try again.', true);
    });
  });

  p.on('error', (err) => {
    joinBtn.disabled = false;
    if(err && err.type === 'peer-unavailable'){
      setStatus('room "' + code + '" was not found. double check the ID.', true);
    } else {
      setStatus('connection error: ' + (err && err.type ? err.type : 'unknown') + '. check your network and try again.', true);
    }
  });
}

function guestHandleData(data){
  if(!data || typeof data !== 'object') return;
  if(data.type === 'chat'){
    addMessage(data.name, data.text, data.name === myName ? 'you' : 'friend');
  } else if(data.type === 'system'){
    addMessage('', data.text, 'system');
  } else if(data.type === 'presence'){
    renderMembers(data.members || []);
  }
}

// ---------- sending ----------
function sendMessage(){
  const text = msgInput.value.trim();
  if(!text) return;
  msgInput.value = '';
  addMessage(myName, text, 'you');

  if(isHost){
    relayExcept(null, { type:'chat', name: myName, text });
  } else if(hostConn){
    try{ hostConn.send({ type:'chat', name: myName, text }); }catch(e){}
  }
}

// ---------- leaving ----------
function leaveRoom(){
  connections.forEach(c => { try{ c.close(); }catch(e){} });
  connections.clear();
  connNames.clear();
  if(hostConn){ try{ hostConn.close(); }catch(e){} hostConn = null; }
  if(peer){ try{ peer.destroy(); }catch(e){} peer = null; }
  isHost = false;
  roomCode = '';
  chatLog.innerHTML = '';
  chatShell.classList.add('hidden');
  gate.classList.remove('hidden');
  setStatus('');
  createBtn.disabled = false;
  joinBtn.disabled = false;
}

// ---------- wiring ----------
createBtn.addEventListener('click', () => createRoom());
joinBtn.addEventListener('click', joinRoom);
codeInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') joinRoom(); });
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') sendMessage(); });
leaveBtn.addEventListener('click', leaveRoom);
copyCodeBtn.addEventListener('click', () => {
  const original = copyCodeBtn.textContent;
  navigator.clipboard.writeText(roomCode).then(() => {
    copyCodeBtn.textContent = 'copied!';
    setTimeout(() => { copyCodeBtn.textContent = original; }, 1500);
  }).catch(() => {
    copyCodeBtn.textContent = roomCode;
  });
});
