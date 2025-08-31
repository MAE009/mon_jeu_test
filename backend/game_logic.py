from database import save_score

games = {}

def start_game(player_name):
    games[player_name] = {"score": 0, "moves": []}
    return {"message": f"Jeu démarré pour {player_name}", "score": 0}

def process_move(player, move):
    if player not in games:
        return {"error": "Joueur inconnu"}
    
    # Logique de jeu simple : +1 point par mouvement
    games[player]["moves"].append(move)
    games[player]["score"] += 1

    # Sauvegarde du score
    save_score(player, games[player]["score"])

    return {"score": games[player]["score"], "last_move": move}
