const OpenAI = require('openai');
const commonTags = require('common-tags');
const Store = require('electron-store');

const store = new Store();

async function getOpenAIInstance() {
  const apiKey = store.get('openai-api-key');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add it in Settings.');
  }

  return new OpenAI({ apiKey });
}

async function summarizeComments(comments) {
  const openai = await getOpenAIInstance();

  const prompt = commonTags.stripIndent`
    Please provide a concise summary of these Hacker News comments. Focus on the main discussion points, insights, and any consensus or disagreements:

    Comments:
    ${comments.join('\n\n')}
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 300
  });

  return completion.choices[0].message.content;
}

module.exports = { summarizeComments };