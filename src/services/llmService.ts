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
    // Create a clearer board representation with coordinates
    const header = '     Col 0  Col 1  Col 2  Col 3'
    const separator = '   +------+------+------+------+'

    const formattedRows = board.map((row, rowIndex) => {
      const cells = row
        .map(cell => (cell?.toString() || '').padStart(4, ' '))
        .join(' |')
      return `${rowIndex} |${cells} |`
    })

    return [header, separator, ...formattedRows, separator].join('\n')
  }

  /**
   * @description Gemini was not working properly, so I have added this function to analyze the board and provide context to the LLM.
   * this function identifies potential merges and non-mergeable adjacent tiles to help the LLM understand the board state better.
   */
  private analyzeBoardForPrompt(board: Board): string {
    const mergeOpportunities: string[] = []
    const adjacentPairs: string[] = []

    // Check for vertical merges (same column)
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 3; row++) {
        const current = board[row]?.[col]
        const next = board[row + 1]?.[col]
        if (current && next) {
          if (current === next) {
            mergeOpportunities.push(
              `✓ VERTICAL MERGE: Two ${current}s in Col ${col} (Row ${row} and Row ${row + 1}) → ${current + current} when moving UP or DOWN`
            )
          } else {
            adjacentPairs.push(
              `✗ NO MERGE: ${current} and ${next} in Col ${col} (Row ${row} and Row ${row + 1}) - different values cannot merge`
            )
          }
        }
      }
    }

    // Check for horizontal merges (same row)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const current = board[row]?.[col]
        const next = board[row]?.[col + 1]
        if (current && next) {
          if (current === next) {
            mergeOpportunities.push(
              `✓ HORIZONTAL MERGE: Two ${current}s in Row ${row} (Col ${col} and Col ${col + 1}) → ${current + current} when moving LEFT or RIGHT`
            )
          } else {
            adjacentPairs.push(
              `✗ NO MERGE: ${current} and ${next} in Row ${row} (Col ${col} and Col ${col + 1}) - different values cannot merge`
            )
          }
        }
      }
    }

    let result = ''
    if (mergeOpportunities.length > 0) {
      result += `AVAILABLE MERGES:\n${mergeOpportunities.join('\n')}`
    } else {
      result += 'NO IMMEDIATE MERGES AVAILABLE'
    }

    if (adjacentPairs.length > 0) {
      result += `\n\nADJACENT NON-MERGEABLE PAIRS:\n${adjacentPairs.join('\n')}`
    }

    if (mergeOpportunities.length === 0) {
      result +=
        '\n\nFocus on positioning tiles for future merges. Only move if it improves tile positioning.'
    }

    return result
  }

  private createPrompt(request: LLMHintRequest): string {
    const boardStr = this.formatBoardForLLM(request.board)
    const analysis = this.analyzeBoardForPrompt(request.board)

    return `You are an expert 2048 game AI. Analyze the current game state and recommend the best next move.

GAME STATE:
Current Board (Row 0 is TOP, Row 3 is BOTTOM):
${boardStr}

Current Score: ${request.score}
Best Score: ${request.bestScore}
Game Over: ${request.gameOver}
Won: ${request.won}

BOARD ANALYSIS:
${analysis}

2048 GAME MECHANICS:
- UP: All tiles slide toward Row 0 (top). Tiles in the same column merge if identical.
- DOWN: All tiles slide toward Row 3 (bottom). Tiles in the same column merge if identical.
- LEFT: All tiles slide toward Col 0 (left). Tiles in the same row merge if identical.
- RIGHT: All tiles slide toward Col 3 (right). Tiles in the same row merge if identical.
- When tiles merge, they combine into one tile with double the value
- After each move, a new tile (2 or 4) appears in a random empty space

CRITICAL MERGING RULES:
- ONLY IDENTICAL TILES CAN MERGE: 2+2=4, 4+4=8, 8+8=16, etc.
- DIFFERENT TILES CANNOT MERGE: 2+4 ≠ anything, 4+8 ≠ anything, etc.
- A tile can only merge ONCE per move
- Tiles must be adjacent (touching) to merge

MERGING EXAMPLES:
✓ VALID: Two 2s become one 4 (2+2=4)
✓ VALID: Two 4s become one 8 (4+4=8)  
✓ VALID: Two 8s become one 16 (8+8=16)
✗ INVALID: 2 and 4 cannot merge together
✗ INVALID: 4 and 8 cannot merge together
✗ INVALID: Any non-identical numbers cannot merge

ANALYSIS STEPS:
1. Identify all possible merges for each direction
2. Calculate which move creates the most merges and highest value
3. Consider keeping larger tiles in corners
4. Ensure move doesn't block future opportunities
5. Prioritize moves that free up space on the board

EXAMPLE ANALYSIS:
If you see two identical tiles in the same column (e.g., two 2s at Row 0 and Row 1 in Col 0):
- UP: The two 2s will merge into one 4 at Row 0, Col 0 ✓ MERGE OCCURS
- DOWN: The two 2s will merge into one 4 at Row 3, Col 0 ✓ MERGE OCCURS  
- LEFT: No merge possible (tiles are in same column, not same row) ✗ NO MERGE
- RIGHT: No merge possible (tiles are in same column, not same row) ✗ NO MERGE

If you see two identical tiles in the same row (e.g., two 2s at Row 0, Col 0 and Row 0, Col 1):
- LEFT: The two 2s will merge into one 4 at Row 0, Col 0 ✓ MERGE OCCURS
- RIGHT: The two 2s will merge into one 4 at Row 0, Col 3 ✓ MERGE OCCURS
- UP: No merge possible (tiles are in same row, not same column) ✗ NO MERGE
- DOWN: No merge possible (tiles are in same row, not same column) ✗ NO MERGE

STRATEGY PRIORITIES (in order):
1. CREATE MERGES FIRST - Always choose moves that merge tiles over moves that don't
2. Keep largest tiles in corners/edges
3. Maintain ordered sequences
4. Keep empty spaces available
5. Build toward 2048

IMPORTANT REMINDER: 
- 2+4 CANNOT merge (different values)
- 4+8 CANNOT merge (different values) 
- 8+16 CANNOT merge (different values)
- ONLY identical tiles merge: 2+2=4, 4+4=8, 8+8=16, etc.

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

CRITICAL: In your reasoning, never mention merging different numbers (like 2+4=8). Only identical tiles can merge.

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
