// This function runs on Netlify's servers, NOT in the user's browser.
// Your real ANTHROPIC_API_KEY lives only here, set as a Netlify environment
// variable — it is never visible to anyone visiting the site.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { form, goalLabels } = JSON.parse(event.body);

    const prompt = `You are an expert car modification advisor. A user wants a detailed modification plan for their car.

Car: ${form.year} ${form.make} ${form.model}
Goals: ${goalLabels.join(", ")}
Budget: ${form.budget}
Experience level: ${form.experience}
Additional notes: ${form.notes || "None"}

Create a structured modification plan. Respond ONLY with valid JSON (no markdown, no explanation), in this exact format:
{
  "summary": "2-3 sentence overview of the build direction",
  "stages": [
    {
      "stage": "Stage 1 — Foundation",
      "priority": "Do first",
      "mods": [
        {
          "name": "Mod name",
          "why": "Why this mod for this car/goal",
          "cost": "$X–$Y",
          "difficulty": "Easy/Medium/Hard",
          "diy": true
        }
      ]
    }
  ],
  "totalEstimate": "$X,XXX–$X,XXX",
  "warnings": ["Any compatibility issues or things to watch out for"],
  "proTip": "One expert insight specific to this car/build"
}

Be specific to the ${form.year} ${form.make} ${form.model}. Give real part names where possible. Keep stages logical — foundation before cosmetics, suspension before power, etc. Max 3 stages, 3-4 mods each.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate plan" })
    };
  }
};
