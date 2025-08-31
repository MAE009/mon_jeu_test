from database import save_score
import random
import time
import math

games = {}
RAYON_INITIAL = 30
MAX_TOLERANCE = 150

def start_game(player_name):
    # Sélection aléatoire de la difficulté
    difficulty = random.choice(["easy", "medium", "hard", "expert"])
    
    # Paramètres selon la difficulté
    if difficulty == "easy":
        tolerance = random.randint(30, 60)
        vitesse = 0.4
        intervalle_multiplier = 0.4
    elif difficulty == "medium":
        tolerance = random.randint(50, 90)
        vitesse = 0.6
        intervalle_multiplier = 0.3
    elif difficulty == "hard":
        tolerance = random.randint(70, 120)
        vitesse = 0.8
        intervalle_multiplier = 0.25
        # Variation de vitesse aléatoire
        vitesse *= random.uniform(0.9, 1.1)
    else:  # expert
        tolerance = random.randint(100, 150)
        vitesse = 1.0
        intervalle_multiplier = 0.2
        # Variation de vitesse plus importante
        vitesse *= random.uniform(0.8, 1.2)
    
    # Calcul du rayon cible avec fonction non linéaire
    rayon_final = RAYON_INITIAL * (1 + math.log(tolerance / 20 + 1))
    
    # Intervalle plus serré pour les niveaux difficiles
    intervalle_range = tolerance * intervalle_multiplier
    intervalle_min = rayon_final - intervalle_range
    intervalle_max = rayon_final + intervalle_range
    
    # Seuil d'éclatement plus serré
    burst_threshold = tolerance * 1.5
    
    games[player_name] = {
        "score": 0,
        "tolerance": tolerance,
        "difficulty": difficulty,
        "rayon_actuel": RAYON_INITIAL,
        "rayon_final": rayon_final,
        "intervalle_min": intervalle_min,
        "intervalle_max": intervalle_max,
        "start_time": time.time(),
        "end_time": None,
        "status": "running",
        "vitesse": vitesse,
        "burst_threshold": burst_threshold,
        "last_update": time.time(),
        "vitesse_actuelle": vitesse,  # Pour les variations de vitesse
        "next_speed_change": time.time() + random.uniform(1.0, 3.0)
    }
    
    return {
        "message": f"Jeu démarré - Niveau: {difficulty.upper()}",
        "tolerance": tolerance,
        "difficulty": difficulty,
        "rayon_initial": RAYON_INITIAL
    }

def update_balloon(player):
    if player not in games or games[player]["status"] != "running":
        return None
    
    game = games[player]
    current_time = time.time()
    elapsed_time = current_time - game["last_update"]
    game["last_update"] = current_time
    
    # Variation de vitesse aléatoire pour les niveaux difficiles
    if game["difficulty"] in ["hard", "expert"] and current_time > game["next_speed_change"]:
        if game["difficulty"] == "hard":
            variation = random.uniform(0.9, 1.1)
        else:  # expert
            variation = random.uniform(0.7, 1.3)
        game["vitesse_actuelle"] = game["vitesse"] * variation
        game["next_speed_change"] = current_time + random.uniform(0.5, 2.0)
    
    # Mise à jour du rayon avec la vitesse actuelle
    game["rayon_actuel"] += game["vitesse_actuelle"] * elapsed_time
    
    # Vérifier si le ballon éclate
    if game["rayon_actuel"] > game["burst_threshold"]:
        game["status"] = "burst"
        game["end_time"] = current_time
        save_score(player, 0)
        return {"status": "burst", "score": 0}
    
    return None

def stop_game(player):
    if player not in games:
        return {"error": "Joueur inconnu"}
    
    update_result = update_balloon(player)
    if update_result:
        return update_result
    
    game = games[player]
    game["end_time"] = time.time()
    rayon_arret = game["rayon_actuel"]
    
    # Calcul de score plus exigeant
    distance = abs(rayon_arret - game["rayon_final"])
    max_distance = game["intervalle_max"] - game["rayon_final"]
    
    if game["intervalle_min"] <= rayon_arret <= game["intervalle_max"]:
        game["status"] = "won"
        # Score basé sur la précision (100% si parfait, décroissant)
        precision = 100 * (1 - (distance / max_distance))
        
        # Bonus de difficulté
        difficulty_bonus = {
            "easy": 1.0,
            "medium": 1.2,
            "hard": 1.5,
            "expert": 2.0
        }[game["difficulty"]]
        
        score = max(10, min(1000, int(precision * 10 * difficulty_bonus)))
        game["score"] = score
        save_score(player, score)
        
        return {
            "status": "won",
            "score": score,
            "rayon_arret": round(rayon_arret, 1),
            "rayon_final": round(game["rayon_final"], 1),
            "intervalle": [round(game["intervalle_min"], 1), round(game["intervalle_max"], 1)],
            "difficulty": game["difficulty"],
            "precision": round(precision, 1)
        }
    else:
        game["status"] = "lost"
        save_score(player, 0)
        return {
            "status": "lost",
            "score": 0,
            "rayon_arret": round(rayon_arret, 1),
            "rayon_final": round(game["rayon_final"], 1),
            "intervalle": [round(game["intervalle_min"], 1), round(game["intervalle_max"], 1)],
            "difficulty": game["difficulty"]
        }

def get_difficulty_color(difficulty):
    colors = {
        "easy": "#00b894",
        "medium": "#fdcb6e",
        "hard": "#e17055",
        "expert": "#d63031"
    }
    return colors.get(difficulty, "#2d3436")
