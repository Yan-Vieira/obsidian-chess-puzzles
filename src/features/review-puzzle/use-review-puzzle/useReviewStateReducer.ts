import { Chess } from "chess.js"
import type { Key } from "chessground/types"
import { useReducer } from "react"

export interface ReviewState {
    currentPuzzleIndex: number
    currentFen: string
    bestLineIndex: number
    boardResetVersion: number
    lastMove?: [Key, Key]
    isPromotion: boolean
    promotionMoveFrom?: string
    promotionMoveTo?: string
}

export type ReviewStateAction =
    | {
        type: "accept-move"
        currentFen: string
        bestLineIndex: number
        lastMove: [Key, Key]
    }
    | {
        type: "begin-promotion"
        promotionMoveFrom: string
        promotionMoveTo: string
    }
    | {
        type: "end-promotion"
        currentFen: string
        bestLineIndex: number
        lastMove: [Key, Key]
    }
    | { type: "cancel-promotion" }
    | { type: "go-to-next-puzzle" }
    | { type: "reject-move" }

export default function useReviewStateReducer (puzzles: ChessPuzzle[]) {

    const [reviewState, updateReviewState] = useReducer(
        (state: ReviewState, action: ReviewStateAction): ReviewState => {

            switch (action.type) {

                case "accept-move":
                    return {
                        ...state,
                        currentFen: action.currentFen,
                        bestLineIndex: action.bestLineIndex,
                        lastMove: action.lastMove
                    }

                case "begin-promotion":
                    return {
                        ...state,
                        boardResetVersion: state.boardResetVersion + 1,
                        lastMove: undefined,
                        isPromotion: true,
                        promotionMoveFrom: action.promotionMoveFrom,
                        promotionMoveTo: action.promotionMoveTo
                    }

                case "end-promotion":
                    return {
                        ...state,
                        isPromotion: false,
                        promotionMoveFrom: undefined,
                        promotionMoveTo: undefined,
                        currentFen: action.currentFen,
                        bestLineIndex: action.bestLineIndex,
                        lastMove: action.lastMove
                    }

                case "cancel-promotion":
                    return {
                        ...state,
                        boardResetVersion: state.boardResetVersion + 1,
                        lastMove: undefined,
                        isPromotion: false,
                        promotionMoveFrom: undefined,
                        promotionMoveTo: undefined
                    }

                case "go-to-next-puzzle": {
                    const nextPuzzleIndex = state.currentPuzzleIndex + 1
                    const nextPuzzle = puzzles[nextPuzzleIndex]

                    if (!nextPuzzle) return state

                    return {
                        ...state,
                        currentPuzzleIndex: nextPuzzleIndex,
                        currentFen: getInitialFen(nextPuzzle),
                        bestLineIndex: 0,
                        lastMove: undefined,
                        isPromotion: false,
                        promotionMoveFrom: undefined,
                        promotionMoveTo: undefined
                    }
                }
                
                case "reject-move":
                    return {
                        ...state,
                        boardResetVersion: state.boardResetVersion + 1,
                        lastMove: undefined,
                        isPromotion: false,
                        promotionMoveFrom: undefined,
                        promotionMoveTo: undefined
                    }
            }
        },
        puzzles,
        createInitialReviewState
    )

    return { reviewState, updateReviewState }
}

const getInitialFen = (puzzle?: ChessPuzzle) =>
    puzzle?.fen ? new Chess(puzzle.fen).fen() : new Chess().fen()

const createInitialReviewState = (puzzles: ChessPuzzle[]): ReviewState => ({
    currentPuzzleIndex: 0,
    currentFen: getInitialFen(puzzles[0]),
    bestLineIndex: 0,
    boardResetVersion: 0,
    lastMove: undefined,
    isPromotion: false
})
