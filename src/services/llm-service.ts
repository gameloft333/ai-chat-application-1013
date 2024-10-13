import { LLMType, LLMResponse, LLMConfig } from '../types/llm';
import { characterLLMConfig, defaultLLMConfig } from '../config/llm-config';
import { LLM_MODULES } from '../config/llm-mapping';

async function callLLMAPI(type: LLMType, prompt: string, apiKey: string, modelName: string): Promise<LLMResponse> {
  const moduleName = LLM_MODULES[type];
  console.log(`Calling ${type} API with model: ${modelName} using module: ${moduleName}`);
  
  try {
    let response: string;

    switch (type) {
      case 'zhipu':
        response = await callZhipuAPI(prompt, apiKey, modelName);
        break;
      case 'moonshot':
        response = await callMoonshotAPI(prompt, apiKey, modelName);
        break;
      case 'gemini':
        response = await callGeminiAPI(prompt, apiKey, modelName);
        break;
      default:
        throw new Error(`Unsupported LLM type: ${type}`);
    }

    return { text: response };
  } catch (error) {
    console.error(`Error calling ${type} API:`, error);
    return { text: 'I apologize, but I encountered an issue while processing your request. Could you please try again?', error: String(error) };
  }
}

async function callZhipuAPI(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const url = 'https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_turbo/sse-invoke';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': apiKey
  };
  const body = JSON.stringify({
    prompt: [{"role": "user", "content": prompt}],
    temperature: 0.95,
    top_p: 0.7,
    incremental: false
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data.choices[0].content;
}

async function callMoonshotAPI(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const url = 'https://api.moonshot.cn/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const body = JSON.stringify({
    model: modelName,
    messages: [{"role": "user", "content": prompt}]
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGeminiAPI(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function getLLMResponse(characterId: string, prompt: string): Promise<LLMResponse> {
  const config: LLMConfig = characterLLMConfig[characterId] || defaultLLMConfig;

  try {
    return await callLLMAPI(config.type, prompt, config.apiKey, config.modelName || '');
  } catch (error) {
    console.error('Error getting LLM response:', error);
    return { text: 'I apologize, but I encountered an unexpected issue. Could you please try your request again?', error: String(error) };
  }
}