import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
const app = express();
const port = process.env.PORT || 5000;

// Set EJS as the view engine
app.set("view engine", "ejs");

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const corsConfig = {
  origin: "*",
  credential: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsConfig));
// Parse application/json
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static("public"));

// Render the index page
app.get("/", (req, res) => {
  res.render("index");
});

// Handle form submission
app.post("/submit-prompt", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("http://localhost:5000/api/prompts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    res.render("index", { response: data.response });
  } catch (error) {
    res.render("index", { response: "Error: " + error.message });
  }
});

// API endpoint to handle the prompt processing
app.post("/api/prompts", async (req, res) => {
  const { prompt } = req.body;
  console.log(prompt);
  try {
    const response = await generateResponse(prompt);
    res.status(200).json({ response: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  maxOutputTokens: 2048,
});
async function generateResponse(prompt) {
  try {
    const response = await model.invoke(prompt);
    return response.content;
  } catch (error) {
    console.error(error);
    return error.message;
  }
}
