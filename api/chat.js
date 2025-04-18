const { Configuration, OpenAIApi } = require("openai");

module.exports = async (req, res) => {
    // Log the incoming request for debugging
    console.log("Incoming request:", req.method, req.headers.origin);

    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Origin", "https://madhavvan.github.io");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
        console.log("Handling OPTIONS preflight request");
        return res.status(200).end();
    }

    // Ensure the request is POST
    if (req.method !== "POST") {
        console.error("Invalid method:", req.method);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Log request body for debugging
        console.log("Received request body:", req.body);

        // Validate request body
        const { message } = req.body || {};
        if (!message) {
            console.error("Request body missing 'message' field");
            return res.status(400).json({ error: "Message is required" });
        }

        // Check for OPENAI_API_KEY
        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is not set in environment variables");
            return res.status(500).json({ error: "Server configuration error: Missing OPENAI_API_KEY" });
        }

        // Initialize OpenAI API
        console.log("Initializing OpenAI API client...");
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
            basePath: "https://api.openai.com/v1", // Use OpenAI's API endpoint
        });
        const openai = new OpenAIApi(configuration);

        // Make API call with a system prompt for advanced responses
        console.log("Sending request to OpenAI API with message:", message);
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo", // Use an OpenAI model
            messages: [
                {
                    role: "system",
                    content: "You are a highly knowledgeable AI assistant specializing in data analysis and insights. Provide detailed, insightful, and professional responses that go beyond basic answers. Use examples, analogies, or additional context to make your replies engaging and 'next-level' for users interested in data science and AI."
                },
                { role: "user", content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        // Log the response
        console.log("Received response from OpenAI API:", response.data);

        // Return response
        res.status(200).json({
            reply: response.data.choices[0].message.content,
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Error in /api/chat:", error.message, error.stack);
        res.status(500).json({ error: `Server error: ${error.message}` });
    }
};