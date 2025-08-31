const API_URL = "https://<TON_URL_RENDERE>/api";

async function startGame() {
    const player = document.getElementById("player").value;
    const response = await fetch(`${API_URL}/start`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({player})
    });
    const data = await response.json();
    document.getElementById("game").innerText = data.message;
}

// Exemple : envoyer un mouvement
async function makeMove(move) {
    const player = document.getElementById("player").value;
    const response = await fetch(`${API_URL}/move`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({player, move})
    });
    const result = await response.json();
    console.log(result);
}