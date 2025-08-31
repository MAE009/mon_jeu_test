from tinydb import TinyDB, Query

db = TinyDB("db.json")

def save_score(player, score):
    Player = Query()
    if db.search(Player.name == player):
        db.update({"score": score}, Player.name == player)
    else:
        db.insert({"name": player, "score": score})

def get_scores():
    return db.all()