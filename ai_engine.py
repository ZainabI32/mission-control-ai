from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()  # Added this line to ai-engine

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_briefing(team_data):

    prompt = f"""
    You are an AI Mission Control assistant.

    Analyse the following team data and:

    1. Identify the top 3 urgent issues
    2. Detect potential burnout signals
    3. Highlight deadline risks
    4. Provide recommended manager actions
    5. Provide a concise executive summary (max 6 lines)

    Data:
    {team_data}

    Structure your response clearly with section headings.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content