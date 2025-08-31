from database import save_score
import random
import time

games = {}
RAYON_INITIAL = 30  # rayon initial en pixels
MAX_TOLERANCE = 100  # tolérance maximale

def start_game(player_name):
    # Générer une tolérance aléatoire entre 20 et MAX_TOLERANCE
    tolerance = random.randint(20, MAX_TOLERANCE)
    
    # Calculer le rayon cible et l'intervalle
    rayon_final = RAYON_INITIAL * (tolerance / 50)  # Ajustement pour le gameplay
    intervalle_min = rayon_final - (tolerance / 2)
    intervalle_max = rayon_final + (tolerance / 2)
    
    games[player_name] = {
        "score": 0,
        "tolerance": tolerance,
        "rayon_actuel": RAYON_INITIAL,
        "rayon_final": rayon_final,
        "intervalle_min": intervalle_min,
        "intervalle_max": intervalle_max,
        "start_time": time.time(),
        "end_time": None,
        "status": "running",  # running, won, burst
        "vitesse": 0.5  # vitesse de gonflement en pixels par seconde
    }
    
    return {
        "message": f"Jeu démarré pour {player_name}",
        "tolerance": tolerance,
        "rayon_initial": RAYON_INITIAL
    }

def update_balloon(player):
    if player not in games or games[player]["status"] != "running":
        return None
    
    game = games[player]
    elapsed_time = time.time() - game["start_time"]
    game["rayon_actuel"] = RAYON_INITIAL + (game["vitesse"] * elapsed_time)
    
    # Vérifier si le ballon éclate
    if game["rayon_actuel"] > game["tolerance"] * 2:  # Seuil d'éclatement
        game["status"] = "burst"
        game["end_time"] = time.time()
        save_score(player, 0)
        return {"status": "burst", "score": 0}
    
    return None

def stop_game(player):
    if player not in games:
        return {"error": "Joueur inconnu"}
    
    # Mettre à jour le rayon actuel
    update_result = update_balloon(player)
    if update_result:
        return update_result
    
    game = games[player]
    game["end_time"] = time.time()
    rayon_arret = game["rayon_actuel"]
    
    # Vérifier si le joueur a gagné
    if game["intervalle_min"] <= rayon_arret <= game["intervalle_max"]:
        game["status"] = "won"
        # Calcul du score basé sur la précision
        precision = 100 - (abs(rayon_arret - game["rayon_final"]) / game["rayon_final"] * 100)
        score = max(0, min(100, int(precision)))
        game["score"] = score
        save_score(player, score)
        return {
            "status": "won",
            "score": score,
            "rayon_arret": round(rayon_arret, 2),
            "rayon_final": round(game["rayon_final"], 2),
            "intervalle": [round(game["intervalle_min"], 2), round(game["intervalle_max"], 2)]
        }
    else:
        game["status"] = "lost"
        save_score(player, 0)
        return {
            "status": "lost",
            "score": 0,
            "rayon_arret": round(rayon_arret, 2),
            "rayon_final": round(game["rayon_final"], 2),
            "intervalle": [round(game["intervalle_min"], 2), round(game["intervalle_max"], 2)]
    }
