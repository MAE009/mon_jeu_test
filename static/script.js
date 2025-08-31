const API_URL = "https://mon-jeu-test.onrender.com" + "/api";

let currentPlayer = "";
let gameInterval = null;
let currentBalloonSize = 30;
let currentDifficulty = "";

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
        document.getElementById("difficulty").textContent = data.difficulty.toUpperCase();
        document.getElementById("difficulty").style.color = getDifficultyColor(data.difficulty);
        
        currentDifficulty = data.difficulty;
        currentBalloonSize = 30;
        startBalloonAnimation();
        
    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de démarrer le jeu");
    }
}

function getDifficultyColor(difficulty) {
    const colors = {
        "easy": "#00b894",
        "medium": "#fdcb6e",
        "hard": "#e17055",
        "expert": "#d63031"
    };
    return colors[difficulty] || "#2d3436";
}

function startBalloonAnimation() {
    currentBalloonSize = 30;
    updateBalloonSize();
    
    if (gameInterval) clearInterval(gameInterval);
    
    // Vitesse d'animation variable selon la difficulté
    const animationSpeed = {
        "easy": 100,
        "medium": 80,
        "hard": 60,
        "expert": 40
    }[currentDifficulty] || 100;
    
    gameInterval = setInterval(async () => {
        try {
            // Simulation plus réaliste du gonflement
            let growthRate = 0.5;
            if (currentDifficulty === "medium") growthRate = 0.7;
            if (currentDifficulty === "hard") growthRate = 0.9;
            if (currentDifficulty === "expert") growthRate = 1.2;
            
            // Variation aléatoire pour les niveaux difficiles
            if (currentDifficulty === "expert" && Math.random() < 0.3) {
                growthRate *= (0.7 + Math.random() * 0.6);
            }
            
            currentBalloonSize += growthRate;
            updateBalloonSize();
            
            document.getElementById("rayon").textContent = Math.round(currentBalloonSize);
            
            // Changement de couleur selon la taille
            updateBalloonColor();
            
        } catch (error) {
            console.error("Erreur:", error);
        }
    }, animationSpeed);
}

function updateBalloonSize() {
    const balloon = document.getElementById("balloon");
    const maxSize = 200;
    const size = Math.min(currentBalloonSize, maxSize);
    
    balloon.style.width = `${size}px`;
    balloon.style.height = `${size}px`;
    
    // Effet visuel de tension quand le ballon est grand
    if (size > 120) {
        balloon.style.boxShadow = "0 0 20px rgba(255, 0, 0, 0.5)";
    } else {
        balloon.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
    }
}

function updateBalloonColor() {
    const balloon = document.getElementById("balloon");
    const tension = Math.min(1, currentBalloonSize / 150);
    
    // Gradient qui devient plus rouge avec la tension
    const red = Math.min(255, 255 * tension);
    const green = Math.max(0, 255 * (1 - tension));
    const blue = Math.max(0, 100 * (1 - tension));
    
    balloon.style.background = `radial-gradient(circle at 30% 30%, rgb(${red}, ${green}, ${blue}), rgb(${red * 0.8}, ${green * 0.8}, ${blue * 0.8}))`;
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
            <div class="won">🎉 VICTOIRE ! (${result.difficulty.toUpperCase()})</div>
            <div>Score: <strong>${result.score}</strong> points</div>
            <div>Précision: ${result.precision}%</div>
            <div>Rayon d'arrêt: ${result.rayon_arret}px</div>
            <div>Cible: ${result.rayon_final}px ±${(result.intervalle[1] - result.intervalle[0])/2}px</div>
            <div>Intervalle: [${result.intervalle[0]}, ${result.intervalle[1]}]px</div>
        `;
    } else if (result.status === "lost") {
        resultDiv.innerHTML = `
            <div class="lost">😞 PERDU ! (${result.difficulty.toUpperCase()})</div>
            <div>Rayon d'arrêt: ${result.rayon_arret}px</div>
            <div>Hors intervalle: [${result.intervalle[0]}, ${result.intervalle[1]}]px</div>
            <div>Cible: ${result.rayon_final}px</div>
        `;
    } else if (result.status === "burst") {
        resultDiv.innerHTML = `
            <div class="burst">💥 BALLON ÉCLATÉ ! (${result.difficulty.toUpperCase()})</div>
            <div>Tolérance maximale dépassée</div>
        `;
    }
}

// Ajouter un effet de vibration pour le bouton STOP
function addVibrationEffect() {
    const stopBtn = document.getElementById("stopBtn");
    stopBtn.addEventListener('mouseover', () => {
        if (currentDifficulty === "expert") {
            stopBtn.style.animation = "vibration 0.1s infinite";
        }
    });
    
    stopBtn.addEventListener('mouseout', () => {
        stopBtn.style.animation = "none";
    });
}

// Appeler au chargement
window.addEventListener('load', addVibrationEffect);
