from flask import Flask, jsonify, render_template
from dotenv import load_dotenv
from ai_engine import generate_briefing

load_dotenv()

app = Flask(__name__)

team_data = """
Project Alpha:
- Deadline in 3 days
- 2 tasks delayed
- Sarah worked past midnight 3 times this week

Project Beta:
- On track
- Tom handling 7 active tasks

Messages:
- "I'm overwhelmed"
- "We might miss the client deadline"
"""

@app.route("/")
def home():
    return render_template("dashboard.html")


@app.route("/briefing", methods=["POST"])
def briefing():
    team_data = request.json["team_data"]
    briefing_text = generate_briefing(team_data)
    return jsonify({"briefing": briefing_text})


if __name__ == "__main__":
    app.run(debug=True)