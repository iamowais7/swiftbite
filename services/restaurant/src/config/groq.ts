const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const askGrok = async (
  messages: ChatMessage[],
  jsonMode = false
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
};

// Asks the model to pick + rank which candidates are relevant to a free-text query.
// Falls back to returning every id (i.e. "no filtering") if the call errors or replies
// with something unparseable, so a flaky/unconfigured AI call never breaks browsing.
export const rankByRelevance = async (
  query: string,
  candidates: { id: string; text: string }[]
): Promise<string[]> => {
  if (!query.trim() || candidates.length === 0) {
    return candidates.map((c) => c.id);
  }

  const list = candidates
    .map((c) => `- id:"${c.id}" -> ${c.text}`)
    .join("\n");

  try {
    const content = await askGrok(
      [
        {
          role: "system",
          content:
            'You are a search relevance engine for a food delivery app. Given a search query and a list of candidates, reply with ONLY a JSON object {"ids": [...]} containing the "id" values of candidates relevant to the query, ordered most-to-least relevant. Match on meaning, not just exact keywords (e.g. "spicy chicken" should match "Peri Peri Wings"). If nothing is relevant, reply {"ids": []}.',
        },
        { role: "user", content: `Query: "${query}"\n\nCandidates:\n${list}` },
      ],
      true
    );
    const parsed = JSON.parse(content);
    const ids = Array.isArray(parsed) ? parsed : parsed.ids;
    if (!Array.isArray(ids)) return candidates.map((c) => c.id);
    const validIds = new Set(candidates.map((c) => c.id));
    return ids.filter((id: unknown) => typeof id === "string" && validIds.has(id));
  } catch (error) {
    console.error("AI relevance ranking failed, returning unfiltered results:", error);
    return candidates.map((c) => c.id);
  }
};
