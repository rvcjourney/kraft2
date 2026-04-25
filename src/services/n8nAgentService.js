// N8N Agent Service
// Handles webhook communication with n8n voice agent platform

const N8N_API_ENDPOINT = "https://n8n.b2botix.ai/webhook/bfsi";
const REQUEST_TIMEOUT_MS = 30000;
const HISTORY_CONTEXT_SIZE = 100; // send full history so Mentor Agent can evaluate the whole session

// Response field priority for parsing n8n responses
const RESPONSE_FIELD_PRIORITY = [
  "response",
  "message",
  "text",
  "output",
  "result",
  "body",
];

/**
 * Extracts agent response text from various n8n response formats
 */
function extractResponse(data) {
  if (typeof data === "string") return data;

  if (typeof data === "object" && data !== null) {
    // Handle array response (n8n sometimes returns array)
    if (Array.isArray(data) && data.length > 0) {
      return extractResponse(data[0]);
    }
    for (const field of RESPONSE_FIELD_PRIORITY) {
      if (data[field]) {
        return typeof data[field] === "string"
          ? data[field]
          : JSON.stringify(data[field]);
      }
    }
  }

  return typeof data === "object" ? JSON.stringify(data) : null;
}

/**
 * Sends a message to the n8n webhook and returns the agent response text.
 *
 * @param {string} sessionId      - Unique session identifier
 * @param {string} userMessage    - User's input message
 * @param {Array}  conversationHistory - Previous {role, content} pairs
 * @param {string} sessionType    - "session1" or "session2"
 * @returns {Promise<string>} Agent response text
 */
export async function generateN8nResponse(sessionId, userMessage, conversationHistory, sessionType = "session1", language = "en", voiceGender = "female") {
  if (!userMessage?.trim()) throw new Error("Message cannot be empty");
  if (!Array.isArray(conversationHistory)) conversationHistory = [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(N8N_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sessionId,
        message: userMessage.trim(),
        sessionType,
        language,
        voiceGender,
        history: conversationHistory.slice(-HISTORY_CONTEXT_SIZE),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    let agentResponse;

    try {
      const data = JSON.parse(responseText);
      agentResponse = extractResponse(data);
    } catch {
      // Plain text response
      agentResponse = responseText;
    }

    if (!agentResponse?.trim()) throw new Error("N8N returned an empty response");

    return agentResponse;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`N8N request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
    }
    throw new Error(`N8N integration failed: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
