import type { LLM_PROVIDER } from '@/store'
import type { Board, Direction } from '@/types'

export interface LLMHintRequest {
  board: Board
  score: number
  bestScore: number
  gameOver: boolean
  won: boolean
}

export interface CellAlternative {
  move: Direction
  reasoning: string
  confidence: number // 0-1 scale
}

export interface LLMHintResponse {
  recommendedMove: Direction | null
  reasoning: string
  confidence: number // 0-1 scale
  alternatives?: CellAlternative[]
}

export interface LLMServiceConfig {
  provider: LLM_PROVIDER
  apiKey: string
}

class LLMService {
  private config: LLMServiceConfig | null = null

  configure(config: LLMServiceConfig) {
    this.config = config
  }

  private formatBoardForLLM(board: Board): string {
    return board
      .map(row =>
        row.map(cell => cell?.toString().padStart(4, ' ') || '   .').join(' | ')
      )
      .join('\n' + '-'.repeat(21) + '\n')
  }

  private createPrompt(request: LLMHintRequest): string {
    const boardStr = this.formatBoardForLLM(request.board)

    return `You are an expert 2048 game AI. Analyze the current game state and recommend the best next move.

GAME STATE:
Current Board:
${boardStr}

Current Score: ${request.score}
Best Score: ${request.bestScore}
Game Over: ${request.gameOver}
Won: ${request.won}

RULES REMINDER:
- Move tiles in one direction: up, down, left, right
- Identical adjacent tiles merge when moved together
- Goal is to create a tile with 2048 (and beyond)
- Maximize score while keeping the board manageable
- Avoid filling the board completely

STRATEGY CONSIDERATIONS:
1. Keep highest tiles in corners/edges
2. Build ordered sequences (e.g., 2, 4, 8, 16...)
3. Always keep escape routes open
4. Prioritize merging opportunities
5. Avoid moves that separate large tiles

Please respond with a JSON object in this exact format:
{
  "recommendedMove": "up|down|left|right",
  "reasoning": "Brief explanation of why this move is best",
  "confidence": 0.85,
  "alternatives": [
    {
      "move": "left",
      "reasoning": "Alternative reasoning",
      "confidence": 0.6
    }
  ]
}

Only respond with valid JSON. Do not include any other text.`
  }

  async getHint(request: LLMHintRequest): Promise<LLMHintResponse> {
    if (!this.config?.apiKey) {
      throw new Error(
        'LLM service not configured. Please set your API key in settings.'
      )
    }

    const prompt = this.createPrompt(request)

    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAI(prompt)
        case 'anthropic':
          return await this.callAnthropic(prompt)
        case 'gemini':
          return await this.callGemini(prompt)
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('LLM service error:', error)
      throw new Error(
        error instanceof Error
          ? `Failed to get AI hint: ${error.message}`
          : 'Failed to get AI hint: Unknown error'
      )
    }
  }

  private async callOpenAI(prompt: string): Promise<LLMHintResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config!.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        error.error?.message || `OpenAI API error: ${response.status}`
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No response content from OpenAI')
    }

    return this.parseResponse(content)
  }

  private async callAnthropic(prompt: string): Promise<LLMHintResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        error.error?.message || `Anthropic API error: ${response.status}`
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      throw new Error('No response content from Anthropic')
    }

    return this.parseResponse(content)
  }

  private async callGemini(prompt: string): Promise<LLMHintResponse> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config!.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        error.error?.message || `Gemini API error: ${response.status}`
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error('No response content from Gemini')
    }

    return this.parseResponse(content)
  }

  private parseResponse(content: string): LLMHintResponse {
    try {
      // Clean up the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate the response structure
      if (
        !parsed.recommendedMove ||
        !parsed.reasoning ||
        typeof parsed.confidence !== 'number'
      ) {
        throw new Error('Invalid response format')
      }

      // Validate direction
      const validDirections: Direction[] = ['up', 'down', 'left', 'right']
      if (!validDirections.includes(parsed.recommendedMove)) {
        throw new Error('Invalid direction in response')
      }

      // Ensure confidence is between 0 and 1
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence))

      // Validate alternatives if present
      if (parsed.alternatives) {
        parsed.alternatives = parsed.alternatives
          .filter(
            (alt: CellAlternative) =>
              alt.move &&
              validDirections.includes(alt.move) &&
              alt.reasoning &&
              typeof alt.confidence === 'number'
          )
          .map((alt: CellAlternative) => ({
            ...alt,
            confidence: Math.max(0, Math.min(1, alt.confidence)),
          }))
      }

      return parsed as LLMHintResponse
    } catch (error) {
      console.error('Failed to parse LLM response:', error)
      throw new Error('Failed to parse AI response. Please try again.')
    }
  }

  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.provider)
  }
}

export const llmService = new LLMService()
