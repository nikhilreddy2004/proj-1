const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs'); // Import the file system module
const path = require('path'); // Import the path module
const axios = require('axios'); // For fetching web content
const cheerio = require('cheerio'); // For parsing HTML

const app = express();
const port = 5001; // Using a port other than 3000 to avoid conflict with React

app.use(cors());
app.use(express.json());

// Initialize the Generative AI model
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined. Please check your .env file.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Health Check Endpoint ---
app.get('/', (req, res) => {
    res.send('The AI summary server is running correctly!');
});

// --- API Endpoint ---
app.post('/generate-summary', async (req, res) => {
    try {
        const { studentName, scores, attendance } = req.body;

        if (!studentName) {
            return res.status(400).send('Student name is required.');
        }

        // 1. Create a detailed prompt for the AI
        const prompt = `
            Generate a concise, 3-sentence progress report for a student named ${studentName}.
            The report should be encouraging and professional, suitable for a teacher or volunteer to read.
            
            Your summary MUST prioritize the student's recent academic performance and attendance record.
            Base your assessment on the following key data points.

            - **Priority 1: Recent Test Scores:** ${scores && scores.length > 0 ? scores.map(s => `${s.subject}: ${s.score}`).join(', ') : 'No recent scores available.'}
            - **Priority 2: Recent Attendance:** ${attendance ? `${attendance.present} days present, ${attendance.absent} days absent in the last week.` : 'No recent attendance data.'}

            Based on this data, please generate a summary that reflects these priorities.
        `;

        // 2. Call the AI model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        
        // 3. Send the summary back to the frontend
        res.json({ summary });

    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).send('Failed to generate summary.');
    }
});

// --- Chatbot Endpoint ---
app.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).send('Message is required.');
        }

        // --- Start of new Knowledge Base logic ---
        let dynamicKnowledge = '';
        const knowledgeUrl = 'https://www.upay.org.in/'; // Using the provided URL

        try {
            const response = await axios.get(knowledgeUrl);
            const html = response.data;
            const $ = cheerio.load(html);
            // Extract text from the body, trying to get meaningful content
            dynamicKnowledge = $('body').text().replace(/\s\s+/g, ' ').trim();
        } catch (scrapeError) {
            console.error('Could not scrape the knowledge URL:', scrapeError);
            // Don't stop the chatbot, just proceed without the dynamic knowledge
        }

        // Read the static knowledge base file
        const staticKnowledge = fs.readFileSync(path.join(__dirname, 'ngo-knowledge-base.txt'), 'utf8');

        // Combine both knowledge sources
        const fullKnowledgeBase = `${staticKnowledge}\n\n--- Additional Information from our Website ---\n${dynamicKnowledge}`;
        // --- End of new Knowledge Base logic ---

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Define the persona and instructions for the model
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `You are Sahay, a friendly and helpful AI assistant for an NGO dedicated to providing education for underprivileged children in India. Your name means 'helper'. Your primary role is to answer questions from users about the NGO's mission, volunteer opportunities, student programs, and how people can contribute. You must stick to topics related to the NGO. If a user asks a question unrelated to the NGO (e.g., about politics, weather, personal opinions), you must politely decline and state that you can only provide information about the NGO's work. Keep your answers concise and encouraging.

                    You MUST use the following information as your primary source of knowledge to answer user questions:
                    ---
                    ${fullKnowledgeBase}
                    ---
                    ` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! My name is Sahay. I'm here to help answer your questions about our NGO's work. How can I assist you today?" }],
                },
                // Now, add the actual conversation history
                ...(history || []),
            ],
            generationConfig: {
                maxOutputTokens: 200,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text });

    } catch (error) {
        console.error("Error with chatbot:", error);
        res.status(500).send('Failed to get response from chatbot.');
    }
});

// --- Learning Plan Endpoint ---
app.post('/generate-learning-plan', async (req, res) => {
    try {
        const { studentName, subject, score } = req.body;

        if (!studentName || !subject || !score) {
            return res.status(400).send('Missing required fields for learning plan.');
        }

        // 1. Load the syllabus
        const syllabusData = fs.readFileSync(path.join(__dirname, 'syllabus.json'), 'utf8');
        const syllabus = JSON.parse(syllabusData);
        const subjectTopics = syllabus[subject] ? syllabus[subject].join(', ') : 'general topics';

        // 2. Define the AI's role and rules
        let ruleBasedInstruction = `
            You are an expert, encouraging tutor for an NGO. Your goal is to create a personalized, one-week micro-learning plan for a student.
            The plan should be simple, actionable, and formatted in clear Markdown.

            Student's Name: ${studentName}
            Subject: ${subject}
            Relevant Topics in this Subject: ${subjectTopics}
            Recent Score in this Subject: ${score}
        `;

        // 3. Add specific instructions based on score
        if (score <= 35) {
            ruleBasedInstruction += `
                **CRITICAL RULE:** The student's score of ${score} is critically low. This is alarming and requires immediate, foundational help.
                Your top priority is to address this. The plan MUST start with a sentence acknowledging this is a focus area.
                Create a gentle, step-by-step recovery plan focusing on the absolute basics of the subject.
            `;
        } else if (score >= 95) { // Using 95+ for excellence
             ruleBasedInstruction += `
                **CRITICAL RULE:** The student's score of ${score} is excellent!
                The plan should start by praising this achievement.
                Include one or two advanced or creative challenge questions to maintain momentum and engagement.
            `;
        } else {
            ruleBasedInstruction += `
                **RULE:** The student has a passing score but has room for improvement.
                Generate a standard improvement plan. Identify one likely weak area within the subject's topics and provide a targeted mini-lesson and practice problems.
            `;
        }

        // 4. Generate the plan
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(ruleBasedInstruction);
        const response = await result.response;
        const plan = response.text();

        res.json({ plan });

    } catch (error) {
        console.error("Error generating learning plan:", error);
        res.status(500).send('Failed to generate learning plan.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 