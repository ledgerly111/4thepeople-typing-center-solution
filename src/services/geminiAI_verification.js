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

    const prompt = `You are a document fraud detection expert. Analyze this document image for signs of forgery or manipulation.

Check for the following fraud indicators:
1. Photoshop artifacts or inconsistent lighting
2. Mismatched fonts or font sizes
3. Irregular spacing or alignment
4. Signs of tampering with watermarks, seals, or stamps
5. Inconsistent image quality across different parts of the document
6. Suspicious patterns that indicate photo replacement
7. Altered or manipulated text
8. Missing or fake security features
9. Color inconsistencies

Return a JSON object with this exact format:
{
    "isFraudulent": true or false,
    "confidence": 0.0 to 1.0 (how confident you are in this assessment),
    "riskLevel": "low", "medium", or "high",
    "indicators": ["list of specific fraud indicators found"],
    "recommendations": ["what to verify manually"]
}

Be thorough but fair. Only mark as fraudulent if you find clear evidence.
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

    const prompt = `You are a data extraction and validation expert.

${prompts[documentType] || prompts.certificate}

Also validate the extracted data:
- Check if all dates are in valid format
- Check if ID/passport numbers follow correct patterns
- Identify any missing required fields
- Flag any inconsistencies

Return JSON:
{
    "data": { extracted data object },
    "validationErrors": ["list of errors found"],
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

    const prompt = `You are a UAE government document compliance expert for ICP/GDRFA/MoHRE submissions.

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
- Valid dates (not expired)
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
