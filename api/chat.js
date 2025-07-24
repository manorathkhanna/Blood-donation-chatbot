const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OFFICIAL_RULES = `
[To be eligible to donate blood, an individual must be between 18 and 65 years of age, weigh more than 45 kilograms, have eaten a meal within the last 4 hours, and must have had at least 5 hours of sleep the previous night. Males can donate once every 3 months, while females can donate once every 4 months. Individuals are not eligible to donate blood if they currently have any major illness or infection, or if they have undergone permanent tattooing, ear or nose piercing, or any major or minor surgery within the last 12 months. Those who are currently pregnant, breastfeeding, or menstruating are also ineligible. Blood donation is not allowed if the person has received a blood transfusion in the last 12 months, has an active skin infection, or is currently experiencing fever, cough, cold, or sore throat. Individuals who have consumed alcohol in the last 24 hours, plan to engage in heavy physical work or night shifts after donation, or have had a tooth extraction within the last 6 months are also ineligible. Anyone with heart disease, coronary artery disease, a history of heart surgery, high-risk behavior, bleeding disorders, jaundice, tuberculosis within the last 2 years, or who is currently taking insulin, steroids, or antibiotics should not donate blood. Those who have received an organ transplant or recovered from COVID-19 less than 28 days ago are also not eligible. Regarding vaccines, individuals must wait for a specific period after vaccination: 2 weeks for vaccines like Pneumococcal, Papilloma Virus, Influenza, Tetanus, Diphtheria, and COVID-19; 4 weeks for Polio, Measles, Mumps, Yellow Fever, and Hepatitis B; and 1 year for the Anti-Rabies vaccine.]
`;

module.exports = async (req, res) => {
  const body = await req.json?.() || req.body;
  const { message } = body;

  const prompt = `
You are a blood donation eligibility assistant.

Use only these official rules:
${OFFICIAL_RULES}

If the user question can be answered strictly using these rules, provide the answer.

If not, respond exactly with: "⛔ Outside rules. Ask user for consent."

User asked: ${message}
  `;

  const miniResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const reply = miniResponse.choices[0].message.content;

  if (reply.includes("⛔ Outside rules")) {
    res.status(200).json({
      followUp: true,
      message:
        "We don’t have a clear eligibility rule for this. Want an answer based on best practices? (Yes/No)",
    });
  } else {
    res.status(200).json({ followUp: false, message: reply });
  }
};
