from flask import Flask, render_template, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Mock team data
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
    <h2>Mission Control Dashboard</h2>
    <button onclick="generate()">Generate AI Briefing</button>
    <pre id="output"></pre>

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

    prompt = f"""
    You are an AI Mission Control assistant.

    Analyse the following team data and:
    1. Identify the top 3 urgent issues
    2. Detect potential burnout signals
    3. Highlight deadline risks
    4. Provide a concise executive summary
    5. Recommend actions for the manager

    Data:
    {team_data}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return jsonify({"briefing": response.choices[0].message.content})

if __name__ == "__main__":
    app.run(debug=True)