declare interface ChessPuzzle {
    filePath: string
    blockStartLine: number
    blockEndLine: number

    fen?: string
    bestLine?: string[]

    lastReview?: string
    nextReview?: string
    ease?: number
    interval?: number
}
