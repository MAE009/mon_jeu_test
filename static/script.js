const API_URL = "https://mon-jeu-test.onrender.com" + "/api";

let currentPlayer = "";
let gameInterval = null;
let currentBalloonSize = 30;

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
        document.getElementById("game").style.display = "block";
        document.getElementById("tolerance").textContent = data.tolerance;
        
        // Démarrer l'animation du ballon
        startBalloonAnimation();
        
    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de démarrer le jeu");
    }
}

function startBalloonAnimation() {
    currentBalloonSize = 30;
    updateBalloonSize();
    
    if (gameInterval) clearInterval(gameInterval);
    
    gameInterval = setInterval(async () => {
        try {
            // Simuler le gonflement (le serveur calcule le vrai rayon)
            currentBalloonSize += 0.5;
            updateBalloonSize();
            
            document.getElementById("rayon").textContent = Math.round(currentBalloonSize);
            
        } catch (error) {
            console.error("Erreur:", error);
        }
    }, 100);
}

function updateBalloonSize() {
    const balloon = document.getElementById("balloon");
    balloon.style.width = `${currentBalloonSize}px`;
    balloon.style.height = `${currentBalloonSize}px`;
}

async function stopGame() {
    if (!currentPlayer) return;
    
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }

    try {
        const response = await fetch(`${API_URL}/stop`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({player: currentPlayer})
        });
        
        if (!response.ok) throw new Error("Erreur d'arrêt");
        
        const result = await response.json();
        showResult(result);
        
    } catch (error) {
        console.error("Erreur:", error);
    }
}

function showResult(result) {
    const resultDiv = document.getElementById("result");
    
    if (result.status === "won") {
        resultDiv.innerHTML = `
            <div class="won">🎉 VICTOIRE !</div>
            <div>Score: ${result.score}/100</div>
            <div>Rayon d'arrêt: ${result.rayon_arret}px</div>
            <div>Intervalle cible: [${result.intervalle[0]}, ${result.intervalle[1]}]px</div>
        `;
    } else if (result.status === "lost") {
        resultDiv.innerHTML = `
            <div class="lost">😞 PERDU !</div>
            <div>Rayon d'arrêt: ${result.rayon_arret}px</div>
            <div>Intervalle cible: [${result.intervalle[0]}, ${result.intervalle[1]}]px</div>
        `;
    } else if (result.status === "burst") {
        resultDiv.innerHTML = `
            <div class="burst">💥 BALLON ÉCLATÉ !</div>
            <div>Le ballon a dépassé la tolérance maximale</div>
        `;
    }
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
    
    const ol = document.createElement("ol");
    scores.forEach((score, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${score.name}</strong>: ${score.score} points`;
        if (index < 3) li.style.fontWeight = "bold";
        ol.appendChild(li);
    });
    
    scoresContainer.appendChild(ol);
            }
