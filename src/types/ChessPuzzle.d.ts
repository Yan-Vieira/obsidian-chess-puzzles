declare interface ChessPuzzle {
    blockStartLine: number
    blockEndLine: number

    name?: string
    fen?: string
    answer?: string

    lastReview?: string
    nextReview?: string
    ease?: number
    interval?: number
}