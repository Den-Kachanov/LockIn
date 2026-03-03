import json
from main import SessionLocal, Reward

# Load JSON file
with open("rewards.json", "r", encoding="utf-8") as f:
    rewards_data = json.load(f)

db = SessionLocal()

for r in rewards_data:
    # Check if reward already exists by name
    existing = db.query(Reward).filter_by(name=r["name"]).first()
    if existing:
        print(f"Reward '{r['name']}' already exists, skipping.")
        continue

    reward = Reward(
        name=r["name"],
        description=r.get("description", ""),
        cost=r.get("cost", 0),
        icon=r.get("icon"),
        color=r.get("color"),
        available=r.get("available", 1)
    )
    db.add(reward)

db.commit()
print(f"{len(rewards_data)} rewards loaded successfully.")
db.close()
