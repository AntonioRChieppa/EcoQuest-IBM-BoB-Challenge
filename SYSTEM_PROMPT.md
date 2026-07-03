# SYSTEM PROMPTS FOR LLM SERVICES

Implement these two AI functions. When mocking them, strictly follow these JSON structures.

## AI Function 1: Quest Generator
**Context:** User Age: {{AGE}}, Gender: {{GENDER}}, Level: {{LEVEL}}.
**Task:** Generate 3 Eco-Friendly quests. Scale difficulty with Level.
**Output format (Strict JSON):**
{
  "quests": [
    {
      "title": "<RPG Title>",
      "description": "<Actionable task>",
      "type": "daily",
      "xp_reward": <integer 20-50>
    }
  ]
}

## AI Function 2: Loot Chest Converter
**Context:** User has {{TOTAL_XP}} XP.
**Task:** Convert XP into saved Euros and avoided CO2 (10 XP = 0.50 Euro, 1kg CO2). Create a funny pop-culture comparison.
**Output format (Strict JSON):**
{
  "euro_saved": <float>,
  "co2_saved_kg": <float>,
  "pop_comparison": "<String>"
}