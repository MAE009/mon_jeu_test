// Auto-détection de l'URL de l'API
const API_URL = "https://mon-jeu-test.onrender.com" + "/api";

let currentPlayer = "";
let currentScore = 0;

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
        
        if (!response.ok) throw new Error("Erreur de démarrage");
        
        const data = await response.json();
        currentScore = 0;
        updateScore();
        
    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de démarrer le jeu");
    }
}

async function makeMove(move) {
    if (!currentPlayer) {
        alert("Veuillez d'abord commencer une partie");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/move`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({player: currentPlayer, move})
        });
        
        if (!response.ok) throw new Error("Erreur de mouvement");
        
        const result = await response.json();
        currentScore = result.score;
        updateScore();
        
    } catch (error) {
        console.error("Erreur:", error);
    }
}

function updateScore() {
    document.getElementById("score").textContent = currentScore;
}

async function getScores() {
    try {
        const response = await fetch(`${API_URL}/scores`);
        if (!response.ok) throw new Error("Erreur de récupération");
        
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
    
    scores.sort((a, b) => b.score - a.score);
    
    const ol = document.createElement("ol");
    scores.forEach(score => {
        const li = document.createElement("li");
        li.textContent = `${score.name}: ${score.score} points`;
        ol.appendChild(li);
    });
    
    scoresContainer.appendChild(ol);
}

function resetGame() {
    currentScore = 0;
    updateScore();
    document.getElementById("scores").innerHTML = "";
}
