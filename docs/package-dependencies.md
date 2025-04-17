# 多语言支持需要添加的依赖项

为了给Interview Coder项目添加多语言支持，需要安装以下NPM依赖包：

```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend --save
```

## 依赖包说明

1. **i18next**
   - 核心国际化库
   - 提供基础的翻译功能
   - 支持复数、上下文、插值等高级翻译特性

2. **react-i18next**
   - i18next的React集成库
   - 提供React组件和钩子（如useTranslation）
   - 支持组件的懒加载和命名空间

3. **i18next-browser-languagedetector**
   - 浏览器语言检测插件
   - 可以从多个来源检测用户首选语言（localStorage、navigator、URL等）
   - 可配置检测顺序和缓存机制

4. **i18next-http-backend**
   - 后端加载插件
   - 支持通过HTTP请求加载翻译文件
   - 可以按需加载不同的语言资源

## 安装后的package.json变更

将在`dependencies`部分添加以下内容：

```json
"dependencies": {
  // ... 现有依赖
  "i18next": "^23.10.0",
  "react-i18next": "^14.0.5",
  "i18next-browser-languagedetector": "^7.2.0",
  "i18next-http-backend": "^2.5.0"
}
```

## 开发环境配置

在开发过程中，您可能需要在`tsconfig.json`中确保TypeScript正确识别这些库：

```json
{
  "compilerOptions": {
    // ... 其他配置
    "types": [
      // ... 其他类型
      "i18next",
      "react-i18next"
    ]
  }
}
```

这些依赖项将提供完整的多语言支持基础设施，让应用程序能够轻松切换中英文界面。 