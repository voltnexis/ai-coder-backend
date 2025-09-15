import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; // <-- import cors

dotenv.config();
const app = express();

app.use(cors({
  origin: "*", // Allows all origins
  methods: ["POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
})); // <-- allow all origins for now
app.use(express.json());

app.post("/chat", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-coder-32b-instruct:free",
        messages: [
          { role: "system", content: "You are a helpful AI programming assistant." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    console.log("OpenRouter Response:", data); // log full response

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "No choices returned", raw: data });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(10000, () => {
  console.log("Server is running on port 10000");
});
