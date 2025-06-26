/* eslint-disable */
// app/api/analyze-text/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// Define a type for the expected request body for better type safety
interface RequestBody {
  text?: string;
  userId?: string;
}

export async function POST(req: Request) {
  // 1. Input Validation and API Key Check
  // ----------------------------------------------------------------
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable not set.");
    return NextResponse.json(
      { error: "Server configuration error: Missing API key." },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { text, userId } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Bad Request: 'text' field is missing or empty." },
      { status: 400 }
    );
  }

  // 2. Prompt Engineering: Give the AI clear instructions
  // ----------------------------------------------------------------
  // This is the most critical change. Instead of just sending the text,
  // we wrap it in a clear prompt telling the model what to do.
  const prompt = `
    Analyze the following resume professionaly. Provide a concise analysis covering all of these point:
    1. **Score**: Score the resume from 1-100. Be extremely specific and use the full range: any integer from 1 to 100 is allowed. Do not round to the nearest 5 or 10. Exceptional resumes should receive scores above 85, strong resumes 70-84, good resumes 60-69, average resumes 50-59, and weak resumes below 49. If the resume is improved and addresses previous feedback, the score should increase accordingly. Do not cluster most resumes in the 60-70 range—be, if they are above 65 bump them up a bit, and if they are below 35 bump them down a bit and be more strict. Be fair and reward clear improvements. Use the entire range and differentiate between resumes. Justify the score in one sentence. go a easy on them and dont go to harsh (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    2.  **Summary**: A 1-5 sentence summary. (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    3.  **Key Points**: a list of key points and major details and important things. (max is 5) (if there are no key highlights, add a list of tips) (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    5. **Title**: a briefe 2-4 word title about the resume (ex: Software Engineer) (Do not include the word resume) (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    5. **Improvements**: a list of the best improvements to stand out and get the best results as possible (max is 8) (put them in categories from high to low relavance) (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    5. **Rewriten Resume**: rewrite the whole resume, include all the improvements, and recommendations, use the areas of concern aswell to make it even better, try to write more and expand on it making it larger, better, and a higher chance to get hired. make it in a well structure paragraph form. (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    6. **Sentiment**: 1 word sentiment on the resume (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    7. **Mistakes**: A list of specific mistakes that the resume has. Be specific and not broad. make some breif and some little more explained (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    8. **Success**: A list of specific good things about the resume, Be specific and not broad. make some breif and some little more explained (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)

    (for every section, (wrap improtant words in ** ex: **Improtant** like headings, or just improtant stuff to know that need to be eye catching like maybe your name, age, or important tips)
    
    Format your response as a JSON object with the keys "score", "sentiment", "key_point", "subject", "title", "summary", "success", "mistakes", "improvements", and "rewriten_resume" Do not include any introductory text, explanations, or markdown formatting like \`\`\`json.
    Only return the raw JSON object.

    Text to analyze:
    ---
    ${text}
    ---
  `;

  try {
    // 3. Calling the Gemini API
    // ----------------------------------------------------------------
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // Add generation config for consistent JSON output
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    // 4. Robust Error Handling for the API Response
    // ----------------------------------------------------------------
    if (!res.ok) {
      // If the API call fails, log the error and return a generic server error
      const errorBody = await res.json();
      console.error("Gemini API Error:", errorBody);
      return NextResponse.json(
        { error: "Failed to fetch analysis from AI service." },
        { status: res.status }
      );
    }

    const data = await res.json();

    // 5. Parsing the AI's Response
    // ----------------------------------------------------------------
    // Instead of returning the whole complex object from Gemini,
    // we extract the useful part, making our API easier to use for the frontend.
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      console.error("No content in Gemini response:", data);
      return NextResponse.json(
        { error: "Failed to parse the analysis from AI response." },
        { status: 500 }
      );
    }

    // The model was asked to return JSON, so we parse it.
    // Use a try-catch in case the model returns malformed JSON.
    try {
      const analysisJson = JSON.parse(analysisText);

      const doc = await addDoc(collection(db, "resumes"), {
        resume: text,
        analysis: analysisJson,
        userId: userId || null,
        createdAt: new Date(),
      });

      return NextResponse.json({ analysis: analysisJson, id: doc.id });
    } catch (e) {
      console.error("Failed to parse JSON from model response:", analysisText);
      // Fallback: return the raw text if JSON parsing fails
      return NextResponse.json({ analysis_raw: analysisText });
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}
