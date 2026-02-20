from flask import Flask, jsonify
from dotenv import load_dotenv
import os
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
    return """
    <h2>🛰 Mission Control Dashboard</h2>
    <button onclick="generate()">Generate AI Briefing</button>
    <pre id="output" style="white-space: pre-wrap;"></pre>

    <script>
    async function generate() {
        const res = await fetch("/briefing");
        const data = await res.json();
        document.getElementById("output").innerText = data.briefing;
    }
    </script>
    """

@app.route("/briefing")
def briefing():
    briefing_text = generate_briefing(team_data)
    return jsonify({"briefing": briefing_text})

if __name__ == "__main__":
    app.run(debug=True)