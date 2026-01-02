// Gemini AI Service for Document Processing
// Uses Google's Gemini API for OCR and document analysis
// API Key is stored securely in .env file (not in code)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

/**
 * Extract customer data from Emirates ID or Passport image
 * @param {string} base64Image - Base64 encoded image string (without data:image prefix)
 * @param {string} mimeType - Image mime type (image/jpeg, image/png, etc.)
 * @returns {Promise<Object>} Extracted customer data
 */
export const extractCustomerFromID = async (base64Image, mimeType = 'image/jpeg') => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const prompt = `You are a document OCR expert. Analyze this ID document (Emirates ID, Passport, or similar) and extract the following information in JSON format:

{
    "name": "Full name as shown on document",
    "id_number": "ID number (Emirates ID number or Passport number)",
    "nationality": "Nationality/Country",
    "date_of_birth": "Date of birth in YYYY-MM-DD format",
    "gender": "M or F",
    "expiry_date": "Document expiry date in YYYY-MM-DD format if visible",
    "document_type": "emirates_id or passport",
    "confidence": "high, medium, or low based on image quality"
}

Important:
- If a field is not clearly visible, use null
- For names, use the English transliteration if both Arabic and English are present
- For Emirates ID, the ID number format is typically 784-XXXX-XXXXXXX-X
- Return ONLY valid JSON, no additional text`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API error:', error);
            throw new Error(error.error?.message || 'Failed to process image');
        }

        const data = await response.json();

        // Extract the text response
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from AI');
        }

        // Parse JSON from response (handle potential markdown code blocks)
        let jsonStr = textResponse;
        if (textResponse.includes('```json')) {
            jsonStr = textResponse.split('```json')[1].split('```')[0].trim();
        } else if (textResponse.includes('```')) {
            jsonStr = textResponse.split('```')[1].split('```')[0].trim();
        }

        const extractedData = JSON.parse(jsonStr);
        return {
            success: true,
            data: extractedData
        };

    } catch (error) {
        console.error('Error extracting data from ID:', error);
        return {
            success: false,
            error: error.message || 'Failed to extract data from document'
        };
    }
};

/**
 * Validate a photo for ICP/GDRFA requirements
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} mimeType - Image mime type
 * @returns {Promise<Object>} Validation result with pass/fail and reasons
 */
export const validatePhoto = async (base64Image, mimeType = 'image/jpeg') => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = `You are a photo validator for UAE government visa applications. Check this photo against these requirements:

1. Background: Must be WHITE or very light grey
2. Face: Must be clearly visible, facing forward
3. Eyes: Must be open and visible (no sunglasses)
4. Expression: Neutral expression
5. Lighting: Even lighting, no shadows on face
6. Quality: High resolution, not blurry

Return JSON format:
{
    "passed": true or false,
    "score": 1-10 rating,
    "issues": ["list of specific issues found"],
    "recommendations": ["suggestions to fix issues"]
}

Return ONLY valid JSON, no additional text.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to validate photo');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from AI');
        }

        let jsonStr = textResponse;
        if (textResponse.includes('```json')) {
            jsonStr = textResponse.split('```json')[1].split('```')[0].trim();
        } else if (textResponse.includes('```')) {
            jsonStr = textResponse.split('```')[1].split('```')[0].trim();
        }

        return {
            success: true,
            data: JSON.parse(jsonStr)
        };

    } catch (error) {
        console.error('Error validating photo:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Convert file to base64 (helper function)
 * @param {File} file - File object from input
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:image/xxx;base64, prefix
            resolve({
                base64,
                mimeType: file.type
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Match services based on natural language description
 * @param {string} userInput - Natural language description (e.g., "golden visa medical typing")
 * @param {Array} availableServices - Array of service objects with {id, name, description}
 * @returns {Promise<Object>} Matched services array
 */
export const matchServices = async (userInput, availableServices) => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // Build service list for the prompt
    const serviceList = availableServices.map(s => `- ${s.name} (ID: ${s.id})`).join('\n');

    const prompt = `You are a service matching assistant for a typing center in UAE. Given a user's description, match it to the available services.

User wants: "${userInput}"

Available services:
${serviceList}

Return a JSON array of matched service IDs. Only return IDs that are highly relevant to the user's request.
- If the user mentions "golden visa", match services related to golden visa processing
- If the user mentions "medical", match medical-related services
- If the user mentions "typing", match typing services
- Match partial words and synonyms (e.g., "docs" should match "documents")

Important:
- Return service IDs as integers
- Only return IDs from the available services list
- If no good matches, return empty array []
- Return ONLY valid JSON array, no additional text

Example response: [1, 5, 12]`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 256,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API error:', error);
            throw new Error(error.error?.message || 'Failed to match services');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from AI');
        }

        // Parse JSON from response
        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const matchedIds = JSON.parse(jsonStr);

        // Validate that matched IDs exist in available services
        const validIds = matchedIds.filter(id =>
            availableServices.some(s => s.id === id)
        );

        return {
            success: true,
            matchedServiceIds: validIds,
            count: validIds.length
        };

    } catch (error) {
        console.error('Error matching services:', error);
        return {
            success: false,
            error: error.message || 'Failed to match services',
            matchedServiceIds: []
        };
    }
};

export default {
    extractCustomerFromID,
    validatePhoto,
    fileToBase64,
    matchServices
};
