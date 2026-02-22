from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_engine import (
    generate_briefing,
    generate_trends,
    generate_risk_score,
    generate_blindspots
)

app = Flask(__name__)
CORS(app)

@app.route("/api/briefing", methods=["POST"])
def create_briefing():
    data = request.get_json()
    team_data = data.get("teamData")
    briefing = generate_briefing(team_data)
    return jsonify({"briefing": briefing})


@app.route("/api/trends", methods=["POST"])
def create_trends():
    data = request.get_json()
    team_data = data.get("teamData")
    trends = generate_trends(team_data)
    return jsonify({"trends": trends})


@app.route("/api/risk", methods=["POST"])
def create_risk():
    data = request.get_json()
    team_data = data.get("teamData")
    score = generate_risk_score(team_data)
    return jsonify({"score": score})


@app.route("/api/blindspots", methods=["POST"])
def create_blindspots_route():
    data = request.get_json()
    team_data = data.get("teamData")
    blindspots = generate_blindspots(team_data)
    return jsonify({"blindspots": blindspots})


@app.route("/", methods=["GET"])
def home():
    return "Mission Control API (Groq) is running."


if __name__ == "__main__":
    app.run(debug=True)
