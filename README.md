# AEL AI Chat Interface

<p align="center">
  <img src="screenshot.svg" alt="AEL AI Chat Interface Screenshot" width="800">
</p>

**A unified chat interface for multiple AI models** — OpenAI (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo) and Anthropic (Claude 3 Opus, Claude 3 Sonnet) — plus a Demo Mode for testing. Features conversation history, customizable system prompts, and full parameter control.

## Features

- **6 Models**: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo, Claude 3 Opus, Claude 3 Sonnet, Demo Mode
- **Conversation History**: Save, load, and manage conversations with localStorage persistence
- **Custom System Prompts**: Presets included (Default, Developer, Writer, Analyst)
- **Parameter Control**: Adjustable temperature and max tokens
- **API Key Management**: Secure storage for OpenAI and Anthropic keys
- **Chat Export**: Download conversations as JSON
- **Demo Mode**: Test the interface without any API key
- **Glassmorphism UI**: Dark theme with blue (#0074FF) accents

## Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Glassmorphism, custom properties, flexbox/grid
- **JavaScript** — Vanilla JS, Fetch API, localStorage
- **APIs** — OpenAI REST API, Anthropic REST API

## Live Demo

https://aymanelmasryael.github.io/ael-ai-chat-interface/

## Usage

### Demo Mode (No API Key Required)
1. Open the app
2. Select "Demo Mode" from the model dropdown
3. Start chatting — responses are simulated

### Real AI Models (API Key Required)
1. Go to **Settings**
2. Enter your OpenAI and/or Anthropic API keys
3. Select your preferred model and adjust parameters
4. Click **Save Settings**
5. Start chatting with real AI responses

### Managing Conversations
- Chats are auto-saved in **History**
- Load previous conversations to continue them
- Export any chat as JSON
- Delete individual conversations or clear all data

## Author

**Ayman Elmasry** — AEL Digital Studio

---

_© 2026 AEL Digital Studio. All rights reserved._
