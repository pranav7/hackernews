const OpenAI = require('openai');
const commonTags = require('common-tags');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function summarizeComments(comments) {
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