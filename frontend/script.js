// URL de l'API - à modifier avec votre URL Render
const API_URL = "https://mon-jeu-test.onrender.com" + "/api";

let currentPlayer = "";

async function startGame() {
    const playerInput = document.getElementById("player");
    currentPlayer = playerInput.value.trim();
    
    if (!currentPlayer) {
        alert("Veuillez entrer votre nom");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/start`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({player: currentPlayer})
        });
        
        if (!response.ok) throw new Error("Erreur réseau");
        
        const data = await response.json();
        document.getElementById("game").style.display = "block";
        document.getElementById("score").textContent = "0";
        
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
    }
}

async function makeMove(move) {
    if (!currentPlayer) return;

    try {
        const response = await fetch(`${API_URL}/move`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({player: currentPlayer, move})
        });
        
        if (!response.ok) throw new Error("Erreur réseau");
        
        const result = await response.json();
        document.getElementById("score").textContent = result.score;
        
    } catch (error) {
        console.error("Erreur:", error);
    }
}

async function getScores() {
    try {
        const response = await fetch(`${API_URL}/scores`);
        if (!response.ok) throw new Error("Erreur réseau");
        
        const scores = await response.json();
        displayScores(scores);
        
    } catch (error) {
        console.error("Erreur:", error);
    }
}

function displayScores(scores) {
    const scoresContainer = document.getElementById("scores");
    scoresContainer.innerHTML = "<h2>🏆 Classement</h2>";
    
    if (scores.length === 0) {
        scoresContainer.innerHTML += "<p>Aucun score enregistré</p>";
        return;
    }
    
    // Trier par score décroissant
    scores.sort((a, b) => b.score - a.score);
    
    const ol = document.createElement("ol");
    scores.forEach(score => {
        const li = document.createElement("li");
        li.textContent = `${score.name}: ${score.score} points`;
        ol.appendChild(li);
    });
    
    scoresContainer.appendChild(ol);
                                 }
