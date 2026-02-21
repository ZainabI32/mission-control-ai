from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Create OpenAI client using secure API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_briefing(team_data: str) -> str:
    """
    Generates an AI-powered Mission Control executive briefing.

    Args:
        team_data (str): Raw team/project information.

    Returns:
        str: Structured executive briefing text.
    """

    prompt = f"""
    You are an advanced AI Mission Control assistant designed to help managers 
    reduce information overload and make fast, intelligent decisions.

    Analyse the following team data and perform the following tasks:

    1. Identify the TOP 3 most urgent issues requiring attention.
    2. Detect any potential burnout or workload imbalance signals.
    3. Highlight deadline risks or delivery concerns.
    4. Provide practical, prioritised recommended actions.
    5. Provide a concise executive summary suitable for a senior manager.

    Team Data:
    {team_data}

    IMPORTANT:
    Structure your response EXACTLY as follows:

    EXECUTIVE SUMMARY:
    (4–6 concise lines)

    TOP 3 URGENT ISSUES:
    1.
    2.
    3.

    BURNOUT SIGNALS:
    -

    DEADLINE RISKS:
    -

    RECOMMENDED ACTIONS:
    -
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You provide structured, executive-level insights."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4  # Lower = more professional and consistent
        )

        return response.choices[0].message.content

    except Exception as e:
        # Return readable error instead of crashing the app
        return f"Error generating briefing: {str(e)}"