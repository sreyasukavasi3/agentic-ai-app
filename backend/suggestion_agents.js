require('dotenv').config();
const { z } = require('zod');
const { Agent, Task, Team } = require('kaibanjs');
const { TavilySearchResults } = require('@langchain/community/tools/tavily_search');

// Define the search tool used by the Research Agent
const searchTool = new TavilySearchResults({
  maxResults: 5,
  apiKey: process.env.TAVILY_API_KEY
});

const subjects = ["english", "math", "science"]

// Agents
const booksAgentMap = new Map();
const topicsAgentMap = new Map();

// Input for agents
// Either subject selection and level or subject selection and strength/weakness

// Output for agents
// Topics agents with topics related to the subject and strength/weakness
// Books agents with books related to the subject and strength/weakness

for(var i = 0; i < subjects.length; i++) {
  let subject = subjects[i];
  booksAgentMap.set(subject,
    new Agent({
      name: `${subject} Book Expert`,
      role: `${subject} Book Expert with Internet Access`,
      goal: `Find books online of ${subject} and summarize them.`,
      background: `Experienced in information gathering, communication, summarization, and providing topics on the subject when needed.`,
      tools: [searchTool]
    })
  )
}

for(var i = 0; i < subjects.length; i++) {
  let subject = subjects[i];
  topicsAgentMap.set(subject,
    new Agent({
      name: `${subject} Expert`,
      role: `${subject} Expert with Internet Access`,
      goal: `Find key topics of ${subject}.`,
      background: `Experienced in information gathering, communication, summarization, and providing topics on the subject when needed.`,
      tools: []
    })
  )
}

// QUIZ GENERATION BASED ON SUBJECT, AGE, GRADE, and SELF DECLARED LEVEL
function createBookSuggestionTeam(subject, age, grade, level, strength=undefined, weakness=undefined) {
  subject = subject.toLowerCase();
  let content = `Find and summarize 5 books related to ${subject} for a user of age ${age}, grade ${grade}, and self evaluated level of ${level}. `;
  if (strength && weakness) {
    content += `The user has strengths in ${strength} and weaknesses in ${weakness}. `;
  }
  content += "The books should be related to the subject and the user should be able to understand them. The books will be used as a reference for the user to study and learn more about the subject."

  const writingTask = new Task({
    title: 'Book Suggestion',
    description: content,
    expectedOutput: `Create a list of books related to ${subject}.`,
    agent: booksAgentMap.get(subject)
  });
  return new Team({
    name: 'Book Suggestion Team',
    agents: [booksAgentMap.get(subject)],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
  });
}

// QUIZ EVALUATION BASED ON SUBJECT, AGE, GRADE, and SELF DECLARED LEVEL
function createTopicSuggestionTeam(subject, age, grade, level, strength=null, weakness=null) {
  subject = subject.toLowerCase();
  let content = `Choose 5 topics related to ${subject} for a user of age ${age}, grade ${grade}, and self evaluated level of ${level}. `;
  if (strength && weakness) {
    content += `The user has strengths in ${strength} and weaknesses in ${weakness}.`;
  }
  content += "The topics should be related to the subject and should be appropriate for the grade. The topics will be used as a reference for the user to study and learn more about the subject."

  const writingTask = new Task({
    title: 'Topic Suggestion',
    description: content,
    expectedOutput: `Create a list of topics related to ${subject} in json format. The json format should be:
    {\"topics\": [
      {
        \"topic\": \"TOPIC HERE\"
      }
    ]}`,
    agent: topicsAgentMap.get(subject),
    outputSchema: z.object({
      topics: z.array(z.object({
        topic: z.string()
      }))
    })
  });
  return new Team({
    name: 'Topic Suggestion Team',
    agents: [topicsAgentMap.get(subject)],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
  });
}

module.exports = { createBookSuggestionTeam, createTopicSuggestionTeam }