// api/chat.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const userMessage = req.body.message;

  const systemPrompt = `
You are a blood donation eligibility checker. 
Always try to answer based only on the official rulebook provided (assumed to be part of your context).
If a question can't be answered from the rulebook, respond: 
“We don’t have a clear eligibility rule for this. Can I answer based on best practices from the internet?”

If user says yes, continue with best-practice guidance.

Be concise, clear, and medically responsible.
`;

  const chatResponse = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: "gpt-4o",
  });

  const reply = chatResponse.choices[0].message.content;
  res.status(200).json({ reply });
}
