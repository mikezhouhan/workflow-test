#!/bin/bash

# 清理旧构建
echo "清理旧构建文件..."
rm -rf dist dist-electron

# 重新构建项目
echo "重新构建项目..."
npm run build

# 检查构建结果
if [ ! -f "./dist/index.html" ]; then
  echo "错误: 构建失败，找不到 dist/index.html 文件"
  exit 1
else
  echo "构建成功, 找到 dist/index.html 文件"
fi

# 清理缓存目录
echo "清理应用缓存..."
APP_DATA_DIR="$HOME/Library/Application Support/interview-coder-v1"
CACHE_DIR="$APP_DATA_DIR/session/Shared Dictionary"

if [ -d "$CACHE_DIR" ]; then
  rm -rf "$CACHE_DIR"
  echo "缓存目录已清理: $CACHE_DIR"
fi

# 启动应用
echo "启动应用..."
npm run start 