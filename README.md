# 2048 Game

A modern implementation of the classic 2048 puzzle game built with React, TypeScript, and Vite. Join the tiles and reach 2048!

![2048 Game](https://img.shields.io/badge/Game-2048-blue) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue) ![Vite](https://img.shields.io/badge/Vite-7.1.6-purple)

## 🎮 How to Play

### Objective
Combine numbered tiles to create a tile with the number **2048** to win the game!

### Game Rules
1. **Movement**: Use arrow keys (↑ ↓ ← →) or WASD keys to move tiles
2. **Merging**: When two tiles with the same number touch, they merge into one
   - 2 + 2 = 4
   - 4 + 4 = 8
   - 8 + 8 = 16
   - And so on...
3. **Spawning**: After each move, a new tile (2 or 4) appears in a random empty spot
4. **Winning**: Reach the 2048 tile to win!
5. **Game Over**: When no more moves are possible (board is full and no merges available)

### Controls
- **Arrow Keys**: ↑ ↓ ← → to move tiles
- **WASD Keys**: Alternative movement controls
- **New Game Button**: Start a fresh game
- **Settings Button**: Access game settings and preferences

### Strategy Tips
- Keep your highest tile in a corner
- Try to build tiles in one direction
- Don't spread high-value tiles across the board
- Plan ahead to avoid getting stuck
- Use the AI hints feature for strategic guidance!

## 🤖 AI Hints Feature

This game includes an intelligent AI assistant that can provide strategic hints for your next move.

### Supported AI Providers
- **OpenAI (GPT)** - Uses GPT-4o-mini model
- **Anthropic (Claude)** - Uses Claude-3-haiku model  
- **Google (Gemini)** - Uses Gemini-1.5-flash model

### Setting Up AI Hints

1. **Open Settings**: Click the gear icon (⚙️) in the top area
2. **Navigate to AI Assistant Section**: Scroll down to find the "AI Assistant" section
3. **Choose Provider**: Select your preferred LLM provider from the dropdown
4. **Add API Key**: Enter your API key in the secure input field

#### Getting API Keys

**OpenAI (GPT)**
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy and paste it into the settings

**Anthropic (Claude)**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into the settings

**Google (Gemini)**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into the settings

### Using AI Hints
- Click the **"AI Hint"** button during gameplay
- The AI will analyze your current board state
- Receive strategic recommendations with confidence levels
- View alternative moves and reasoning
- **Note**: API key is stored locally and never shared

## 🚀 Installation & Development

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 2048
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Start playing!

### Deployment

This project is configured for automatic deployment to GitHub Pages.

#### Automatic Deployment
- Push to the `main` branch triggers automatic deployment
- GitHub Actions handles build, test, and deployment
- Site will be available at `https://navbytes.github.io/2048/`

#### Manual Deployment
```bash
npm run deploy
```

#### Setup GitHub Pages
1. Go to your repository **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**
3. Push your code to trigger the first deployment

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:ci` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types
- `npm run deploy` - Deploy to GitHub Pages
- `npm run clean` - Clean build artifacts

## ✨ Features

### Game Features
- **Classic 2048 Gameplay** - Traditional tile-merging mechanics
- **Responsive Design** - Works on desktop and mobile devices
- **Keyboard Controls** - Arrow keys and WASD support
- **Score Tracking** - Current score and best score persistence
- **Game State Persistence** - Auto-save and resume functionality
- **Win/Lose Detection** - Automatic game state management

### Visual & Accessibility
- **Multiple Themes** - Light, Dark, and System themes
- **High Contrast Mode** - Enhanced accessibility
- **Smooth Animations** - Optional tile movement animations
- **Different Display Modes**:
  - Normal: 2, 4, 8, 16...
  - Power of 2: ¹, ², ³, ⁴...
  - Binary: 10, 100, 1000, 10000...

### AI & Advanced Features
- **AI Hints** - Strategic move suggestions from multiple AI providers
- **Smart Analysis** - AI considers board state, merges, and positioning
- **Confidence Scoring** - Percentage confidence for each suggestion
- **Alternative Moves** - Multiple strategic options with reasoning
- **Secure API Storage** - Local-only API key storage

### Technical Features
- **Fast Performance** - Optimized React components with memoization
- **Type Safety** - Full TypeScript implementation
- **Comprehensive Testing** - Unit tests with Vitest
- **Modern Tooling** - ESLint, Prettier, Husky pre-commit hooks
- **Modular Architecture** - Clean component and service separation

## 🛠️ Technologies Used

### Core Framework
- **React 19.1.1** - UI library with modern hooks
- **TypeScript 5.9.2** - Type-safe JavaScript
- **Vite 7.1.6** - Fast build tool and dev server

### State Management & Utilities
- **Zustand 5.0.8** - Lightweight state management
- **clsx 2.1.1** - Conditional className utility
- **debug 4.4.3** - Debug utility for development

### UI & Icons
- **Lucide React 0.544.0** - Beautiful icons
- **CSS Modules** - Scoped styling

### Development & Testing
- **Vitest 3.2.4** - Fast unit testing
- **Testing Library** - React testing utilities
- **ESLint 9.36.0** - Code linting
- **Prettier 3.6.2** - Code formatting
- **Husky 9.1.7** - Git hooks

### AI Integration
- **OpenAI API** - GPT-4o-mini integration
- **Anthropic API** - Claude-3-haiku integration
- **Google Gemini API** - Gemini-1.5-flash integration

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Cell.tsx        # Individual game tile
│   ├── GameBoard.tsx   # Main game grid
│   ├── GameControls.tsx # Game controls and score
│   ├── HintButton.tsx  # AI hint functionality
│   ├── Modal.tsx       # Reusable modal component
│   └── Settings.tsx    # Settings and preferences
├── constants/          # Game constants and configuration
├── hooks/              # Custom React hooks
│   └── useAIHints.ts   # AI hint integration
├── services/           # External service integrations
│   └── llmService.ts   # LLM API service
├── store/              # Zustand state management
│   ├── gameStore.ts    # Game state and logic
│   └── settingsStore.ts # User preferences
├── styles/             # CSS modules and global styling
│   ├── global.css      # Global styles and CSS variables
│   └── *.module.css    # Component-specific CSS modules
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
│   ├── boardUtils.ts   # Board manipulation utilities
│   ├── gameActions.ts  # Game action handlers
│   ├── gameValidation.ts # Game state validation
│   ├── mergeLogic.ts   # Tile merging logic
│   └── storage.ts      # Local storage utilities
└── App.tsx            # Main application component
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

- [ ] Multiplayer support
- [ ] Tournament mode
- [ ] More AI providers
- [ ] Custom board sizes
- [ ] Theme customization
- [ ] Mobile app version

---

**Enjoy playing 2048!** 🎮 

For questions or issues, please open a GitHub issue or contribute to the project.