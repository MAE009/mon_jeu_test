from tinydb import TinyDB, Query
import os

db_path = os.path.join(os.path.dirname(__file__), "db.json")
db = TinyDB(db_path)

def save_score(player, score):
    Player = Query()
    existing = db.search(Player.name == player)
    
    if existing:
        # Garder le meilleur score
        if score > existing[0]["score"]:
            db.update({"score": score}, Player.name == player)
    else:
        db.insert({"name": player, "score": score})

def get_scores():
    return sorted(db.all(), key=lambda x: x["score"], reverse=True)
