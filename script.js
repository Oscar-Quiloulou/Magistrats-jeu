let sessionCode = '';
let currentRole = '';
let roleChosen = false;
let isCreator = false;
let pseudo = '';
let avatar = '';
const avatars = ['🦁', '🐺', '🦊', '🐵', '🐸', '🐼', '🐧', '🐤'];

function showMessage(text) {
  const msg = document.getElementById("message");
  msg.innerText = text;
  msg.classList.remove("hidden");
  setTimeout(() => {
    msg.classList.add("hidden");
  }, 5000);
}

function createSession() {
  pseudo = document.getElementById("pseudo").value.trim();
  if (pseudo === '') {
    showMessage("Entre ton pseudo !");
    return;
  }
  avatar = avatars[Math.floor(Math.random() * avatars.length)];

  sessionCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  isCreator = true;
  currentRole = 'Consul';
  roleChosen = true;

  db.ref('sessions/' + sessionCode).set({
    roles: {
      Consul: true,
      Préteur: false,
      Édile: false,
      Questeur: false
    }
  });

  document.getElementById("sessionDisplay").classList.remove("hidden");
  document.getElementById("sessionCodeDisplay").innerText = sessionCode;
  showMessage("Tu es le Consul.");
  document.getElementById("session").classList.add("hidden");
  document.getElementById("chatContainer").classList.remove("hidden");
  listenForMessages();
  showMission(currentRole);
}

function joinSession() {
  pseudo = document.getElementById("pseudo").value.trim();
  if (pseudo === '') {
    showMessage("Entre ton pseudo !");
    return;
  }
  avatar = avatars[Math.floor(Math.random() * avatars.length)];

  const codeInput = document.getElementById("sessionCode").value.toUpperCase();
  if (codeInput.length < 5) {
    showMessage("Code invalide");
    return;
  }

  db.ref('sessions/' + codeInput).once('value', snapshot => {
    if (snapshot.exists()) {
      sessionCode = codeInput;
      document.getElementById("session").classList.add("hidden");
      document.getElementById("roleSelection").classList.remove("hidden");
      document.getElementById("sessionDisplay").classList.remove("hidden");
      document.getElementById("sessionCodeDisplay").innerText = sessionCode;
      document.getElementById("chatContainer").classList.remove("hidden");
      listenForMessages();
    } else {
      showMessage("Session introuvable !");
    }
  });
}

function selectRole(role) {
  if (roleChosen) {
    showMessage("Tu as déjà choisi ton rôle !");
    return;
  }

  db.ref(`sessions/${sessionCode}/roles/${role}`).once('value', snapshot => {
    if (snapshot.val() === true) {
      showMessage("Ce rôle est déjà pris !");
    } else {
      db.ref(`sessions/${sessionCode}/roles/${role}`).set(true);
      currentRole = role;
      roleChosen = true;
      document.getElementById("roleSelection").classList.add("hidden");
      showMission(role);
    }
  });
}

function showMission(role) {
  function showMission(role) {
  const missions = {
    "Consul": `
      <h2>👑 Consul</h2>
      <p>Prépare un discours pour rassurer le peuple.</p>
      <textarea placeholder="Écris ton discours ici..." rows="6" cols="50"></textarea>
    `,
    "Préteur": `
      <h2>⚖️ Préteur</h2>
      <p>Résous le conflit entre le citoyen romain et le marchand grec.</p>
      <textarea placeholder="Décris ton enquête et ta solution..." rows="6" cols="50"></textarea>
    `,
    "Édile": `
      <h2>🏗️ Édile</h2>
      <p>Libère la voie Appienne bloquée par un chariot.</p>
      <textarea placeholder="Décris ton plan logistique..." rows="6" cols="50"></textarea>
    `,
    "Questeur": `
      <h2>💰 Questeur</h2>
      <p>Propose une solution pour financer les fortifications.</p>
      <textarea placeholder="Décris ta stratégie financière..." rows="6" cols="50"></textarea>
    `
  };

  document.getElementById("mission").classList.remove("hidden");
  document.getElementById("mission").innerHTML = missions[role];
}

// Envoyer un message dans le chat
function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message === '') return;

  const timestamp = Date.now();
  db.ref(`sessions/${sessionCode}/chat/${timestamp}`).set({
    text: message,
    pseudo: pseudo,
    avatar: avatar
  });

  input.value = '';
}

// Écouter les nouveaux messages
function listenForMessages() {
  const chatBox = document.getElementById("chatBox");
  db.ref(`sessions/${sessionCode}/chat`).on('child_added', snapshot => {
    const msg = snapshot.val();
    const p = document.createElement("p");
    p.innerHTML = `<strong>${msg.avatar} ${msg.pseudo} :</strong> ${msg.text}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
