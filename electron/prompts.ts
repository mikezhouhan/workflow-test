// prompts.ts - 存放AI提示文本

// 定义 ProblemInfo 接口，用于类型提示
interface ProblemInfo {
  problem_statement: string;
  constraints?: string;
  example_input?: string;
  example_output?: string;
}

/**
 * 生成用于提取编程问题的提示
 * @param responseLanguage - LLM 响应的目标语言 (e.g., 'en', 'zh-CN')
 */
export function generateProblemExtractionPrompt(responseLanguage: string): string {
  // 強調語言要求
  const languageInstruction = `IMPORTANT: Your entire response MUST be in ${responseLanguage}. Do not use any other language.`;
  return `You are a coding challenge interpreter. ${languageInstruction} Analyze the screenshot of the coding problem and extract all relevant information. Return the information in JSON format with these fields: problem_statement, constraints, example_input, example_output. Just return the structured JSON without any other text. ${languageInstruction}`;
}

/**
 * 生成用于生成解决方案的提示
 * @param problemInfo - 包含问题详情的对象
 * @param programmingLanguage - 目标编程语言
 * @param responseLanguage - LLM 响应的目标语言
 */
export function generateSolutionPrompt(
  problemInfo: ProblemInfo,
  programmingLanguage: string,
  responseLanguage: string
): string {
  // 強調語言要求
  const languageInstruction = `IMPORTANT: Your entire response MUST be in ${responseLanguage}. Only code comments should be in English. Do not use any other language for explanations or section titles.`;
  return `
${languageInstruction}
Generate a detailed solution for the following coding problem:

PROBLEM STATEMENT:
${problemInfo.problem_statement}

CONSTRAINTS:
${problemInfo.constraints || "No specific constraints provided."}

EXAMPLE INPUT:
${problemInfo.example_input || "No example input provided."}

EXAMPLE OUTPUT:
${problemInfo.example_output || "No example output provided."}

PROGRAMMING LANGUAGE: ${programmingLanguage}

RESPONSE LANGUAGE: ${responseLanguage} (This confirms the required language is ${responseLanguage})

I need the response in the following format (Ensure all text below, including section headers and explanations, is STRICTLY in ${responseLanguage}, except for code comments which should be in English):
1. ### Code (Comments MUST be in English)
   Provide a clean, optimized implementation in ${programmingLanguage}.
2. ### My Thoughts (MUST be in ${responseLanguage})
   Explain your reasoning step-by-step. IMPORTANT: This explanation MUST be entirely in ${responseLanguage}.
3. ### Time Complexity (MUST be in ${responseLanguage})
   Provide the Big O notation (e.g., O(n)) and a detailed explanation (at least 2 sentences). CRITICAL: This analysis MUST be entirely in ${responseLanguage}.
4. ### Space Complexity (MUST be in ${responseLanguage})
   Provide the Big O notation (e.g., O(1)) and a detailed explanation (at least 2 sentences). CRITICAL: This analysis MUST be entirely in ${responseLanguage}.

For complexity explanations (CRITICAL: MUST be in ${responseLanguage}), please be thorough. For example (ensure the explanation text itself is in ${responseLanguage}): "Time complexity: O(n) because we iterate through the array only once. This is optimal as we need to examine each element at least once to find the solution." or "Space complexity: O(n) because in the worst case, we store all elements in the hashmap. The additional space scales linearly with the input size."

Your solution should be efficient, well-commented (comments in English), and handle edge cases.
${languageInstruction}
`;
}

/**
 * 生成调试系统提示
 * @param responseLanguage - LLM 响应的目标语言
 */
export function generateDebugSystemPrompt(responseLanguage: string): string {
  // 強調語言要求
  const languageInstruction = `IMPORTANT: Your entire response MUST be in ${responseLanguage}. Only code comments should be in English. Do not use any other language for explanations, section titles, or bullet points.`;
  return `${languageInstruction}
You are a coding interview assistant helping debug and improve solutions. Analyze these screenshots which include either error messages, incorrect outputs, or test cases, and provide detailed debugging help.

Your response MUST follow this exact structure with these section headers (use ### for headers). All text MUST be in ${responseLanguage} except for code comments:
### Issues Identified (in ${responseLanguage})
- List each issue as a bullet point with clear explanation (in ${responseLanguage}).

### Specific Improvements and Corrections (in ${responseLanguage})
- List specific code changes needed as bullet points (in ${responseLanguage}). Include code snippets if necessary (comments in English).

### Optimizations (in ${responseLanguage})
- List any performance optimizations if applicable (in ${responseLanguage}).

### Explanation of Changes Needed (in ${responseLanguage})
Here provide a clear explanation of why the changes are needed (in ${responseLanguage}).

### Key Points (in ${responseLanguage})
- Summary bullet points of the most important takeaways (in ${responseLanguage}).

If you include code examples, use proper markdown code blocks with language specification (e.g. \`\`\`java). Code comments should be in English.
${languageInstruction}`;
}

/**
 * 生成调试用户提示
 * @param problemInfo - 包含问题详情的对象
 * @param programmingLanguage - 目标编程语言
 * @param responseLanguage - LLM 响应的目标语言
 */
export function generateDebugUserPrompt(
  problemInfo: ProblemInfo,
  programmingLanguage: string,
  responseLanguage: string
): string {
  // 強調語言要求
  const languageInstruction = `IMPORTANT: Please provide your entire response in ${responseLanguage} language. Only code comments should be in English. Do not use any other language for explanations or bullet points.`;
  return `I'm solving this coding problem: "${problemInfo.problem_statement}" in ${programmingLanguage}. I need help with debugging or improving my solution. Here are screenshots of my code, the errors or test cases. Please provide a detailed analysis. ${languageInstruction}
Your analysis should include (all text in ${responseLanguage} except code comments):
1. What issues you found in my code
2. Specific improvements and corrections (include code snippets if needed, comments in English)
3. Any optimizations that would make the solution better
4. A clear explanation of the changes needed

${languageInstruction}`;
}
