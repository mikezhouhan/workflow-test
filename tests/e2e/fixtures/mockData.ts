/**
 * 模拟用户数据
 */
export const mockUser = {
  id: '1',
  name: '测试用户',
  email: 'test@example.com'
};

/**
 * 模拟面试数据
 */
export const mockInterviewData = {
  id: '123',
  title: '前端开发面试',
  questions: [
    {
      id: 'q1',
      text: '请解释React的虚拟DOM原理',
      expectedAnswer: '虚拟DOM是React的核心概念，它是一个轻量级的JavaScript对象，是对真实DOM的抽象表示...'
    },
    {
      id: 'q2',
      text: '什么是闭包?',
      expectedAnswer: '闭包是指有权访问另一个函数作用域中变量的函数，创建闭包的常见方式是在一个函数内创建另一个函数...'
    }
  ]
};

/**
 * 模拟配置数据
 */
export const mockConfig = {
  apiKey: 'test-api-key',
  apiProvider: 'openai', // Changed to openai
  extractionModel: 'gpt-4o-mini', // Changed to openai model
  solutionModel: 'gpt-4o-mini', // Changed to openai model
  debuggingModel: 'gpt-4o-mini', // Changed to openai model
  programmingLanguage: 'python',
  opacity: 1.0
}; 