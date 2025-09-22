const firebaseConfig = {
  apiKey: "AIzaSyDPCI_OHhZ2QMM71Ui7tW_1PTk6GepRCAA",
  authDomain: "magistrat-jeu.firebaseapp.com",
  databaseURL: "https://magistrat-jeu-default-rtdb.firebaseio.com",
  projectId: "magistrat-jeu",
  storageBucket: "magistrat-jeu.firebasestorage.app",
  messagingSenderId: "895720693179",
  appId: "1:895720693179:web:e8fa7ed1cbf927034e789e",
  measurementId: "G-MCTF1Y5DNM"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
