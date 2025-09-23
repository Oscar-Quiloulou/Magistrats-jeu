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
  if (pseudo === '') return showMessage("Entre ton pseudo !");
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
  if (pseudo === '') return showMessage("Entre ton pseudo !");
  avatar = avatars[Math.floor(Math.random() * avatars.length)];

  const codeInput = document.getElementById("sessionCode").value.toUpperCase();
  if (codeInput.length < 5) return showMessage("Code invalide");

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
  if (roleChosen) return showMessage("Tu as déjà choisi ton rôle !");

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
  const missions = {
    "Consul": `<h2>👑 Consul