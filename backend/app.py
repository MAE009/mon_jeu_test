from flask import Flask, request, jsonify
from flask_cors import CORS
from game_logic import start_game, process_move
from database import save_score, get_scores
import os

app = Flask(__name__)
CORS(app)  # Permet d'appeler l'API depuis le navigateur

# Lancer une nouvelle partie
@app.route("/api/start", methods=["POST"])
def api_start():
    player_name = request.json.get("player")
    game_data = start_game(player_name)
    return jsonify(game_data)

# Traiter un mouvement du joueur
@app.route("/api/move", methods=["POST"])
def api_move():
    move = request.json.get("move")
    player = request.json.get("player")
    result = process_move(player, move)
    return jsonify(result)

# Récupérer les scores
@app.route("/api/scores", methods=["GET"])
def api_scores():
    scores = get_scores()
    return jsonify(scores)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)
