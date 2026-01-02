// AI Document Verification Functions
// Fraud detection, data extraction, and compliance checking
// All processing done client-side - NO documents saved to Supabase

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

/**
 * Detect potential fraud in documents
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image mime type
 * @returns {Promise<Object>} Fraud detection results
 */
export const detectDocumentFraud = async (base64Image, mimeType = 'image/jpeg') => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // Get current date for context
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const prompt = `IMPORTANT: Today's date is ${currentDate}. Use this as reference for all date validations.

You are a document fraud detection expert with a sense of humor. Analyze this image carefully.

FIRST, identify what type of image this is:
- Emirates ID (official UAE identity card)
- Passport (travel document)
- Visa (immigration document)
- Certificate (educational/professional certificate)
- Other official document
- NOT A DOCUMENT (photo of person, animal, food, object, scenery, etc.)

IF THIS IS NOT AN OFFICIAL DOCUMENT:
Respond with humor and helpfulness! Examples:
- For a photo of food: "That looks delicious! 🍎 But I'm a document verification AI, not a food critic. Please upload an Emirates ID, Passport, Visa, or Certificate instead."
- For a photo of a person: "Nice photo! 😊 But I need to see an official identity document (Emirates ID, Passport, Visa, or Certificate), not a selfie!"
- For a photo of an animal: "Cute! 🐱 But unless this cat has an Emirates ID, I can't help. Please upload an official document."
- For random objects: "Interesting! But I'm designed to verify identity documents, not [describe what you see]. Upload an Emirates ID, Passport, Visa, or Certificate."

IF IT IS AN OFFICIAL DOCUMENT:
Check for fraud indicators:
1. Photoshop artifacts or inconsistent lighting
2. Mismatched fonts or font sizes
3. Irregular spacing or alignment
4. Signs of tampering with watermarks, seals, or stamps
5. Inconsistent image quality across different parts
6. Suspicious patterns indicating photo replacement
7. Altered or manipulated text
8. Missing or fake security features
9. Color inconsistencies
10. Dates that don't make sense (e.g., expiry before issue, future dates for past events)

Return a JSON object with this exact format:
{
    "documentType": "exact type (e.g., 'Emirates ID', 'Passport', 'Not a document - [description]')",
    "isFraudulent": true or false (false if not a document),
    "confidence": 0.0 to 1.0,
    "riskLevel": "low", "medium", or "high",
    "indicators": ["specific fraud indicators OR funny description of what this actually is"],
    "recommendations": ["if not a document: funny message + 'Please upload an Emirates ID, Passport, Visa, or Certificate.' If document: what to verify manually"]
}

Be thorough, fair, and add personality when appropriate!
Return ONLY valid JSON, no additional text.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64Image } }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
            })
        });

        if (!response.ok) {
            throw new Error('Fraud detection failed');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from AI');
        }

        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Fraud detection error:', error);
        throw error;
    }
};

/**
 * Extract and validate data from documents
 * @param {string} base64Image - Base64 encoded image
 * @param {string} documentType - Type of document (emirates_id, passport, certificate, etc.)
 * @param {string} mimeType - Image mime type
 * @returns {Promise<Object>} Extracted and validated data
 */
export const extractAndValidateData = async (base64Image, documentType, mimeType = 'image/jpeg') => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured.');
    }

    const prompts = {
        emirates_id: `Extract ALL data from this Emirates ID:
{
    "name": "full name",
    "id_number": "Emirates ID number",
    "nationality": "nationality",
    "date_of_birth": "YYYY-MM-DD",
    "gender": "M or F",
    "issue_date": "YYYY-MM-DD",
    "expiry_date": "YYYY-MM-DD",
    "card_number": "card number if visible"
}`,
        passport: `Extract ALL data from this Passport:
{
    "name": "full name",
    "passport_number": "passport number",
    "nationality": "nationality",
    "date_of_birth": "YYYY-MM-DD",
    "gender": "M or F",
    "issue_date": "YYYY-MM-DD",
    "expiry_date": "YYYY-MM-DD",
    "place_of_birth": "place of birth if visible"
}`,
        visa: `Extract ALL data from this Visa Application/Document:
{
    "applicant_name": "name",
    "passport_number": "passport number",
    "nationality": "nationality",
    "visa_type": "type of visa",
    "sponsor_name": "sponsor if visible",
    "dates": "any relevant dates"
}`,
        certificate: `Extract ALL data from this Certificate:
{
    "holder_name": "name on certificate",
    "certificate_type": "type of certificate",
    "issue_date": "issue date",
    "issuing_authority": "who issued it",
    "certificate_number": "number if visible"
}`
    };

    // Get current date for context
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const prompt = `IMPORTANT: Today's date is ${currentDate} (${todayStr}).

DATE VALIDATION LOGIC (READ CAREFULLY):
✅ VALID Examples:
- Issue date 2025-12-24 when today is 2026-01-03 = VALID (December 2025 is BEFORE January 2026)
- Issue date 2024-05-10 when today is 2026-01-03 = VALID (2024 is before 2026)
- Expiry date 2027-12-23 when today is 2026-01-03 = VALID (2027 is AFTER 2026, expiry should be future)

❌ INVALID Examples:
- Issue date 2026-02-15 when today is 2026-01-03 = INVALID (February 2026 is AFTER January 2026)
- Issue date 2027-01-01 when today is 2026-01-03 = INVALID (2027 is in the future, can't issue yet)
- Expiry date 2025-01-01 when today is 2026-01-03 = INVALID (already expired)

HOW TO COMPARE DATES:
1. Compare YEAR first (2025 < 2026, so 2025 is in the past)
2. If same year, compare MONTH (12 < 01 means December is earlier than January of NEXT year)
3. If same month, compare DAY

You are a data extraction and validation expert.

${prompts[documentType] || prompts.certificate}

Validate the extracted data:
- Check if all dates are in YYYY-MM-DD format
- For ISSUE dates: Must be in the PAST (before ${todayStr})
- For EXPIRY dates: Should be in the FUTURE (after ${todayStr})
- Expiry date must be AFTER issue date
- Check if ID/passport numbers follow correct patterns
- Identify missing required fields
- Flag inconsistencies

Return JSON:
{
    "data": { extracted data object },
    "validationErrors": ["ONLY list ACTUAL errors - do NOT flag past issue dates as future!"],
    "missingFields": ["fields that should be present but aren't"],
    "confidence": 0.0 to 1.0
}

Return ONLY valid JSON, no additional text.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64Image } }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
            })
        });

        if (!response.ok) {
            throw new Error('Data extraction failed');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from AI');
        }

        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Data extraction error:', error);
        throw error;
    }
};

/**
 * Check document compliance with ICP/GDRFA requirements
 * @param {string} base64Image - Base64 encoded image
 * @param {string} documentType - Type of document
 * @param {string} mimeType - Image mime type
 * @returns {Promise<Object>} Compliance check results
 */
export const checkCompliance = async (base64Image, documentType, mimeType = 'image/jpeg') => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured.');
    }

    // Get current date for context
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const prompt = `IMPORTANT: Today's date is ${currentDate}. Use this for validating document dates.

You are a UAE government document compliance expert for ICP/GDRFA/MoHRE submissions.

Check if this ${documentType} meets official requirements:

For Photos (if this is a passport photo or similar):
- White or light-colored background (not blue, red, or patterned)
- Face clearly visible, not cut off
- No glasses (unless medical necessity)
- No headwear (unless religious reasons)
- Proper lighting (not too dark or overexposed)
- Recent photo (not old or faded)
- Correct size ratio (typically 4.3cm x 5.5cm for passports)

For Documents:
- All text is legible and clear
- No torn or damaged areas
- All required stamps/seals are present
- Photo attached securely (if required)
- No handwritten corrections
- Valid dates (not expired relative to ${currentDate})
- Proper format and layout

Return JSON:
{
    "isCompliant": true or false,
    "overallScore": 0.0 to 1.0,
    "issues": ["list of non-compliance issues"],
    "warnings": ["things that might cause rejection"],
    "recommendations": ["how to fix each issue"]
}

Return ONLY valid JSON, no additional text.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64Image } }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
            })
        });

        if (!response.ok) {
            throw new Error('Compliance check failed');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from AI');
        }

        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Compliance check error:', error);
        throw error;
    }
};

export default {
    detectDocumentFraud,
    extractAndValidateData,
    checkCompliance
};
