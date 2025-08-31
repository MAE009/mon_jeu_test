from tinydb import TinyDB, Query
import os

# Utiliser un chemin absolu pour le fichier de base de données
db_path = os.path.join(os.path.dirname(__file__), "db.json")
db = TinyDB(db_path)

def save_score(player, score):
    Player = Query()
    if db.search(Player.name == player):
        db.update({"score": score}, Player.name == player)
    else:
        db.insert({"name": player, "score": score})

def get_scores():
    return db.all()
