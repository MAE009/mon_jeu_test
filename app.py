from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from game_logic import start_game, stop_game, get_scores
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# Servir les fichiers statiques
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# API Routes
@app.route("/api/start", methods=["POST"])
def api_start():
    player_name = request.json.get("player")
    game_data = start_game(player_name)
    return jsonify(game_data)

@app.route("/api/stop", methods=["POST"])
def api_stop():
    player = request.json.get("player")
    result = stop_game(player)
    return jsonify(result)

@app.route("/api/scores", methods=["GET"])
def api_scores():
    scores = get_scores()
    return jsonify(scores)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)
