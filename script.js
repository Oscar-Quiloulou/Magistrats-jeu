let sessionCode = '';
let currentRole = '';
let roleChosen = false;
let isCreator = false;

// Affichage visuel des messages
function showMessage(text) {
  const msg = document.getElementById("message");
  msg.innerText = text;
  msg.classList.remove("hidden");
  setTimeout(() => {
    msg.classList.add("hidden");
  }, 5000);
}

// Créer une session
function createSession() {
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

  showMessage("Session créée : " + sessionCode + " — Tu es le Consul.");
  document.getElementById("session").classList.add("hidden");
  showMission(currentRole);
}

// Rejoindre une session
function joinSession() {
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
    } else {
      showMessage("Session introuvable !");
    }
  });
}

// Choisir un rôle
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

// Afficher la mission
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
