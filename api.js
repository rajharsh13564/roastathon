
// Configuration - Access VITE environment variables securely on the client side
const CONFIG = {
    // VITE exposes variables prefixed with VITE_ to the client
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY, 
    NANOBANANA_API_KEY: import.meta.env.VITE_NANOBANANA_API_KEY 
};

// Validate that API keys are present (using VITE-accessible keys)
if (!CONFIG.GEMINI_API_KEY || !CONFIG.NANOBANANA_API_KEY) {
    console.error('API keys are not properly configured. Ensure your .env file is loaded and keys are prefixed with VITE_.');
    // Set placeholders to avoid crashing, but the functions will still fail.
    CONFIG.GEMINI_API_KEY = "PLACEHOLDER_KEY";
    CONFIG.NANOBANANA_API_KEY = "PLACEHOLDER_KEY";
}

// 1. REINTRODUCED: Roasting styles for prompt variety
const ROASTING_STYLES = [
    "sarcastic and witty",
    "playfully mocking",
    "with clever wordplay",
    "in a deadpan, unimpressed tone",
    "like a snarky best friend",
    "with exaggerated shock",
    "using ironic comparisons",
    "like a bored genius",
    "with backhanded compliments",
    "like a disappointed teacher"
];

function getRandomRoastStyle() {
    return ROASTING_STYLES[Math.floor(Math.random() * ROASTING_STYLES.length)];
}

/**
 * Generates a roasted response using Google Gemini API
 * @param {string} userMessage - The user's message to roast
 * @returns {Promise<string>} - The roasted response
 */
async function generateRoast(userMessage) {
    if (CONFIG.GEMINI_API_KEY === "PLACEHOLDER_KEY") {
        throw new Error("Gemini API key is missing. Please check your VITE configuration.");
    }
    
    try {
        // Use a random style to ensure prompt variety
        const roastStyle = getRandomRoastStyle();  
        
        const prompt = `You are a master of comebacks with a sharp wit.  
        Respond to the user's message with a ${roastStyle} roast.  
        **CRITICAL:** You must generate a unique, non-repetitive response for every message.
        Keep it under 3 sentences.  
        Be creative, funny, and never actually mean or offensive.
        Reference specific parts of their message if possible.
        Vary your responses - don't use the same joke structure every time.
        
        User's message: "${userMessage}"`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            // FIX: Increased temperature to 0.9 to maximize creativity and prevent repetition
            config: {  
                temperature: 0.9 // <-- Higher value increases variability
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to generate roast: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        const roast = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim(); 
        return roast || "Oh please, give me something more interesting to work with than that!";
    } catch (error) {
        console.error('Error generating roast:', error);
        return "My circuits are too busy being awesome to come up with a roast right now. Try again when I care more.";
    }
}

/**
 * Generates an image using NanoBanana API
 * @param {string} prompt - The image description
 * @returns {Promise<string>} - URL of the generated image
 */
async function generateImage(prompt) {
    if (CONFIG.NANOBANANA_API_KEY === "PLACEHOLDER_KEY") {
        throw new Error("NanoBanana API key is missing. Please check your VITE configuration.");
    }

    try {
        // Note: This is a placeholder implementation for NanoBanana API
        const response = await fetch('https://api.nanobanana.ai/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.NANOBANANA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                width: 512,
                height: 512,
                steps: 50,
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to generate image: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        // Assuming the API returns a 'url' field in the response body
        return data.url || 'https://via.placeholder.com/512?text=Image+Generation+Failed';
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error("My artistic skills are as bad as your jokes. Try again later.");
    }
}

// Export the functions
window.RoastAPI = {
    generateRoast,
    generateImage
};