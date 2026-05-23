# 项目协作约定

- 默认用简体中文回复；命令、代码、日志和报错保留原文。
- 涉及前端大工程、UI 优化、视觉实现、复杂交互、多文件重构或自动化测试时，优先把 Gemini CLI 作为高级开发协作者使用。
- 调用 Gemini CLI 时，默认在当前具体项目目录启动持久交互会话，让 Gemini 接管一段连续开发/调试任务，而不是每次只发一个短请求。
- Gemini CLI 启动命令优先使用：

```powershell
& 'C:\Users\zhaowei\AppData\Roaming\npm\gemini.ps1' --skip-trust --yolo
```

- 严禁在 `C:\Users\zhaowei` 用户根目录启动 Gemini CLI；必须进入明确项目目录后再调用，避免索引范围过大。
- Codex 负责给 Gemini 注入项目背景、任务边界和验收标准；Gemini 完成后，Codex 必须审查代码变更、运行必要验证，并向用户交付最终结果。
- 如果 Gemini CLI 卡住、不可用或输出不达标，Codex 立即切回手动实现模式并说明原因。
