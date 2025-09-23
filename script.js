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

function acceptConditions() {
  document.getElementById("consentBlock").classList.add("hidden");
  document.getElementById("session").classList.remove("hidden");
}

// Activer le bouton "J'accepte" seulement si toutes les cases sont cochées
const checkboxes = ['c1', 'c2', 'c3', 'c4', 'c5'];
checkboxes.forEach(id => {
  document.addEventListener("DOMContentLoaded", () => {
    const box = document.getElementById(id);
    box.addEventListener('change', () => {
      const allChecked = checkboxes.every(cid => document.getElementById(cid).checked);
      document.getElementById("acceptBtn").disabled = !allChecked;
    });
  });
});

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
    if (!snapshot.exists()) return showMessage("Session introuvable !");
    
    sessionCode = codeInput;
    document.getElementById("session").classList.add("hidden");
    document.getElementById("roleSelection").classList.remove("hidden");
    document.getElementById("sessionDisplay").classList.remove("hidden");
    document.getElementById("sessionCodeDisplay").innerText = sessionCode;
    document.getElementById("chatContainer").classList.remove("hidden");
    listenForMessages();
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
    "Consul": `
      <h2>👑 Consul</h2>
      <p>Prépare un discours pour rassurer le peuple.</p>
      <textarea placeholder="Écris ton discours ici..." rows="6" cols="50"></textarea>
      <button onclick="submitMission()">Soumettre ma mission</button>
      <button onclick="viewReport()">Voir le rapport final</button>
    `,
    "Préteur": `
      <h2>⚖️ Préteur</h2>
      <p>Résous le conflit entre le citoyen romain et le marchand grec.</p>
      <textarea placeholder="Décris ton enquête et ta solution..." rows="6" cols="50"></textarea>
      <button onclick="submitMission()">Soumettre ma mission</button>
      <button onclick="viewReport()">Voir le rapport final</button>
    `,
    "Édile": `
      <h2>🏗️ Édile</h2>
      <p>Libère la voie Appienne bloquée par un chariot.</p>
      <textarea placeholder="Décris ton plan logistique..." rows="6" cols="50"></textarea>
      <button onclick="submitMission()">Soumettre ma mission</button>
      <button onclick="viewReport()">Voir le rapport final</button>
    `,
    "Questeur": `
      <h2>💰 Questeur</h2>
      <p>Propose une solution pour financer les fortifications.</p>
      <textarea placeholder="Décris ta stratégie financière..." rows="6" cols="50"></textarea>
      <button onclick="submitMission()">Soumettre ma mission</button>
      <button onclick="viewReport()">Voir le rapport final</button>
    `
  };

  document.getElementById("mission").classList.remove("hidden");
  document.getElementById("mission").innerHTML = missions[role];
}

function submitMission() {
  const content = document.querySelector("#mission textarea").value.trim();
  if (content === '') {
    showMessage("Ta mission est vide !");
    return;
  }

  db.ref(`sessions/${sessionCode}/report/${pseudo}`).set({
    role: currentRole,
    avatar: avatar,
    text: content
  });

  showMessage("Mission enregistrée !");
}

function viewReport() {
  const reportDiv = document.getElementById("report");
  const reportContent = document.getElementById("reportContent");
  reportContent.innerHTML = '';
  reportDiv.classList.remove("hidden");

  db.ref(`sessions/${sessionCode}/report`).once('value', snapshot => {
    const data = snapshot.val();
    if (!data) {
      reportContent.innerHTML = "<p>Aucune mission soumise pour l'instant.</p>";
      return;
    }

    for (const player in data) {
      const entry = data[player];
      const block = document.createElement("div");
      block.style.border = "1px solid #ccc";
      block.style.margin = "10px";
      block.style.padding = "10px";
      block.innerHTML = `
        <strong>${entry.avatar} ${player} (${entry.role})</strong><br/>
        <p>${entry.text}</p>
      `;
      reportContent.appendChild(block);
    }
  });
}

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

function loadRules() {
  fetch('regles.txt')
    .then(response => response.text())
    .then(text => {
      document.getElementById("rulesContent").textContent = text;
      document.getElementById("rules").classList.remove("hidden");
    })
    .catch(() => {
      showMessage("Impossible de charger les règles.");
    });
}

function hideRules() {
  document.getElementById("rules").classList.add("hidden");
}

function loadConditions() {
  fetch('conditions.txt')
    .then(response => response.text())
    .then(text => {
      document.getElementById("conditionsContent").textContent = text;
      document.getElementById("conditions").classList.remove("hidden");
    })
    .catch(() => {
      showMessage("Impossible de charger les conditions.");
    });
}

function hideConditions() {
  document.getElementById("conditions").classList.add("hidden");
}

function deleteSession() {
  if (!sessionCode) return showMessage("Aucune session active.");
  db