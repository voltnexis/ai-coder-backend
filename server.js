import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";

dotenv.config();
const app = express();

// CORS must be first
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Available models with their configurations
const MODELS = {
  "qwen3-coder": {
    id: "qwen/qwen3-coder:free",
    name: "Qwen3 Coder",
    cost: "free",
    category: "powerful",
    system: "You are Qwen3 Coder, an AI assistant created by Alibaba Cloud. You are a helpful programming assistant."
  },
  "deepseek-r1-distill": {
    id: "deepseek/deepseek-r1-distill-llama-70b:free",
    name: "DeepSeek R1 Distill Llama 70B",
    cost: "free",
    category: "powerful",
    system: "You are DeepSeek R1 Distill, an AI assistant created by DeepSeek. You are a helpful programming assistant."
  },
  "deepseek-r1": {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    cost: "free",
    category: "powerful",
    system: "You are DeepSeek R1, an AI assistant created by DeepSeek. You are a helpful programming assistant."
  },
  "llama-4-scout": {
    id: "meta-llama/llama-4-scout:free",
    name: "Meta Llama 4 Scout",
    cost: "free",
    category: "powerful",
    system: "You are Llama 4 Scout, an AI assistant created by Meta. You are a helpful programming assistant."
  },
  "qwen-2.5-72b": {
    id: "qwen/qwen-2.5-72b-instruct:free",
    name: "Qwen 2.5 72B Instruct",
    cost: "free",
    category: "powerful",
    system: "You are Qwen 2.5 72B, an AI assistant created by Alibaba Cloud. You are a helpful programming assistant."
  },
  "llama-3.3-70b": {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Meta Llama 3.3 70B Instruct",
    cost: "free",
    category: "powerful",
    system: "You are Llama 3.3 70B, an AI assistant created by Meta. You are a helpful programming assistant."
  },
  "gpt-oss-120b": {
    id: "openai/gpt-oss-120b:free",
    name: "OpenAI GPT-OSS 120B",
    cost: "free",
    category: "powerful",
    system: "You are GPT OSS 120B, an open-source AI assistant. You are a helpful programming assistant."
  },

  "mistral-small-3.1": {
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    name: "Mistral Small 3.1 24B",
    cost: "free",
    category: "medium",
    system: "You are Mistral Small 3.1, an AI assistant created by Mistral AI. You are a helpful programming assistant."
  },
  "mistral-small-24b": {
    id: "mistralai/mistral-small-24b-instruct-2501:free",
    name: "Mistral Small 24B",
    cost: "free",
    category: "medium",
    system: "You are Mistral Small, an AI assistant created by Mistral AI. You are a helpful programming assistant."
  },
  "dolphin3-r1-mistral": {
    id: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    name: "Dolphin3.0 R1 Mistral 24B",
    cost: "free",
    category: "medium",
    system: "You are Dolphin 3.0 R1, an AI assistant. You are a helpful programming assistant."
  },
  "dolphin3-mistral": {
    id: "cognitivecomputations/dolphin3.0-mistral-24b:free",
    name: "Dolphin3.0 Mistral 24B",
    cost: "free",
    category: "medium",
    system: "You are Dolphin 3.0, an AI assistant. You are a helpful programming assistant."
  },
  "deepseek-chat-v3.1": {
    id: "deepseek/deepseek-chat-v3.1:free",
    name: "DeepSeek Chat V3.1",
    cost: "free",
    category: "medium",
    system: "You are DeepSeek Chat V3.1, an AI assistant created by DeepSeek. You are a helpful programming assistant."
  },
  "deepseek-chat-v3": {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat V3",
    cost: "free",
    category: "medium",
    system: "You are DeepSeek Chat V3, an AI assistant created by DeepSeek. You are a helpful programming assistant."
  },
  "deephermes-3": {
    id: "nousresearch/deephermes-3-llama-3-8b-preview:free",
    name: "Nous DeepHermes 3 Llama 3 8B",
    cost: "free",
    category: "medium",
    system: "You are DeepHermes 3, an AI assistant created by Nous Research. You are a helpful programming assistant."
  },
  "qwen2.5-vl-32b": {
    id: "qwen/qwen2.5-vl-32b-instruct:free",
    name: "Qwen2.5 VL 32B Instruct",
    cost: "free",
    category: "medium",
    vision: true,
    system: "You are Qwen 2.5 VL 32B, an AI assistant created by Alibaba Cloud. You are a helpful programming assistant with vision capabilities."
  },
  "qwen-2.5-coder-32b": {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder 32B",
    cost: "free",
    category: "medium",
    system: "You are Qwen 2.5 Coder 32B, an AI assistant created by Alibaba Cloud. You are a helpful programming assistant."
  },
  "mistral-nemo": {
    id: "mistralai/mistral-nemo:free",
    name: "Mistral Nemo",
    cost: "free",
    category: "medium",
    system: "You are Mistral Nemo, an AI assistant created by Mistral AI. You are a helpful programming assistant."
  },
  "gpt-oss-20b": {
    id: "openai/gpt-oss-20b:free",
    name: "OpenAI GPT-OSS 20B",
    cost: "free",
    category: "medium",
    system: "You are GPT OSS 20B, an open-source AI assistant. You are a helpful programming assistant."
  },
  "kimi-k2": {
    id: "moonshotai/kimi-k2:free",
    name: "Kimi K2",
    cost: "free",
    category: "medium",
    system: "You are Kimi K2, an AI assistant created by Moonshot AI. You are a helpful programming assistant."
  },
  "grok-4-fast": {
    id: "x-ai/grok-4-fast:free",
    name: "xAI Grok 4 Fast",
    cost: "free",
    category: "lightweight",
    system: "You are Grok 4 Fast, an AI assistant created by xAI. You are a helpful programming assistant."
  },
  "glm-4.5-air": {
    id: "z-ai/glm-4.5-air:free",
    name: "Z.AI GLM 4.5 Air",
    cost: "free",
    category: "lightweight",
    system: "You are GLM 4.5 Air, an AI assistant created by Zhipu AI. You are a helpful programming assistant."
  },
  "nemotron-nano": {
    id: "nvidia/nemotron-nano-9b-v2:free",
    name: "NVIDIA Nemotron Nano 9B V2",
    cost: "free",
    category: "lightweight",
    system: "You are Nemotron Nano 9B, an AI assistant created by NVIDIA. You are a helpful programming assistant."
  },
  "gemini-2-flash": {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Google Gemini 2.0 Flash",
    cost: "free",
    category: "lightweight",
    system: "You are Gemini 2.0 Flash, an AI assistant created by Google. You are a helpful programming assistant."
  },
  "gemma-3n-e2b": {
    id: "google/gemma-3n-e2b-it:free",
    name: "Google Gemma 3N E2B",
    cost: "free",
    category: "lightweight",
    system: "You are Gemma 3N E2B, an AI assistant created by Google. You are a helpful programming assistant."
  },
  "gemma-3-4b": {
    id: "google/gemma-3-4b-it:free",
    name: "Google Gemma 3 4B",
    cost: "free",
    category: "lightweight",
    system: "You are Gemma 3 4B, an AI assistant created by Google. You are a helpful programming assistant."
  },
  "gemma-3n-e4b": {
    id: "google/gemma-3n-e4b-it:free",
    name: "Google Gemma 3N E4B",
    cost: "free",
    category: "lightweight",
    system: "You are Gemma 3N E4B, an AI assistant created by Google. You are a helpful programming assistant."
  },
  "gemma-3-12b": {
    id: "google/gemma-3-12b-it:free",
    name: "Google Gemma 3 12B",
    cost: "free",
    category: "lightweight",
    system: "You are Gemma 3 12B, an AI assistant created by Google. You are a helpful programming assistant."
  },
  "gemma-3-27b": {
    id: "google/gemma-3-27b-it:free",
    name: "Google Gemma 3 27B",
    cost: "free",
    category: "lightweight",
    system: "You are Gemma 3 27B, an AI assistant created by Google. You are a helpful programming assistant."
  },
  "gemma-2-9b": {
    id: "google/gemma-2-9b-it:free",
    name: "Google Gemma 2 9B",
    cost: "free",
    category: "lightweight",
    system: "You are Gemma 2 9B, an AI assistant created by Google. You are a helpful programming assistant."
  },
  "llama-3.2-3b": {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Meta Llama 3.2 3B Instruct",
    cost: "free",
    category: "lightweight",
    system: "You are Llama 3.2 3B, an AI assistant created by Meta. You are a helpful programming assistant."
  },
  "venice-uncensored": {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Venice Uncensored",
    cost: "free",
    category: "lightweight",
    system: "You are Venice, an AI assistant created by Meta. You are a helpful programming assistant."
  }
};

app.get("/test", (req, res) => {
  res.json({ status: "Server working", apiKey: process.env.OPENROUTER_API_KEY ? "Present" : "Missing" });
});

app.get("/models", (req, res) => {
  res.json({ models: MODELS });
});

app.post("/generate-image", async (req, res) => {
  const { prompt, model = "pollination-free" } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  
  try {


    // Fallback to text description for other models
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { 
            role: "system", 
            content: "You are an AI that can generate images. Describe the image in detail based on the user's prompt." 
          },
          { role: "user", content: `Generate an image: ${prompt}` }
        ]
      })
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "No response from image generation model" });
    }

    res.json({ 
      description: data.choices[0].message.content,
      note: "Image generation is experimental. This is a text description of what would be generated."
    });

  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/chat", upload.single('image'), async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, model = "qwen3-coder" } = req.body;
  const selectedModelId = MODELS[model]?.id || MODELS["qwen3-coder"].id;
  const modelConfig = MODELS[model] || MODELS["qwen3-coder"];
  
  console.log(`Using model: ${model} -> ${selectedModelId}`);

  try {


    // Check API key for OpenRouter models
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY not found in environment variables");
      return res.status(500).json({ error: "API key not configured" });
    }

    let userMessage = { role: "user", content: message };
    
    // Handle image upload for OpenRouter vision models
    if (req.file && modelConfig.vision) {
      const imageBase64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      
      userMessage = {
        role: "user",
        content: [
          { type: "text", text: message },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`
            }
          }
        ]
      };
    }
    
    const requestBody = {
      model: selectedModelId,
      messages: [
        { role: "system", content: modelConfig.system },
        userMessage
      ]
    };
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      return res.status(500).json({ error: `API error: ${response.status}` });
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      console.error("No choices in response:", data);
      return res.status(500).json({ error: "No response from AI model", raw: data });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(10000, () => {
  console.log("Server is running on port 10000");
});
