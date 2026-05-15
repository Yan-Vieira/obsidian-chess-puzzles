import Chessground from "@react-chess/chessground"
import formatPuzzlePath from "./utils/formatPuzzlePath"
import type { Dests, Color } from "chessground/types"
import PromotionMenu from "./PromotionMenu"
import { PieceSymbol } from "chess.js"

const BOARD_SIZE = 400
const SQUARE_SIZE = BOARD_SIZE / 8

export interface BoardProps {
    currentPuzzle?: ChessPuzzle
    currentFen: string
    boardResetVersion: number
    validMoves: Dests
    currentColor: Color
    playerColor: Color
    currentCheck?: Color
    showPromotionMenu: boolean
    promotionMoveTo?: string
    onMove: (from: string, to: string) => void
    onPromotion: (promotion: PieceSymbol) => void
}

export default function Board({
    currentPuzzle,
    currentFen,
    boardResetVersion,
    validMoves,
    currentColor,
    playerColor,
    currentCheck,
    showPromotionMenu,
    promotionMoveTo,
    onMove,
    onPromotion
}:BoardProps) {

    const promotionMenuPosition = getPromotionMenuPosition(promotionMoveTo, playerColor)

    return (
        <>
        <em>{formatPuzzlePath(currentPuzzle)}</em>
        <div className="chess-puzzle-board">
            <Chessground
                key={boardResetVersion}
                width={BOARD_SIZE}
                height={BOARD_SIZE}
                config={{
                    turnColor: currentColor,
                    orientation: playerColor,
                    fen: currentFen,
                    check: currentCheck,
                    movable: {
                        free: false,
                        dests: validMoves
                    },
                    events: {
                        move: onMove
                    }
                }}
            />
            {showPromotionMenu && promotionMenuPosition && (
                <PromotionMenu
                    position={promotionMenuPosition}
                    color={currentColor}
                    onClick={onPromotion}
                />
            )}
        </div>
        </>
    )
}

const getPromotionMenuPosition = (square: string | undefined, orientation: Color) => {

    if (!square || square.length !== 2) return undefined

    const fileIndex = square.charCodeAt(0) - "a".charCodeAt(0)
    const rank = Number(square.charAt(1))

    if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return undefined

    const visualFileIndex = orientation === "white" ? fileIndex : 7 - fileIndex
    const visualRankIndex = orientation === "white" ? 8 - rank : rank - 1
    const squareLeft = visualFileIndex * SQUARE_SIZE
    const squareTop = visualRankIndex * SQUARE_SIZE
    const horizontalPosition =
        visualFileIndex === 0 ? "left" :
        visualFileIndex === 7 ? "right" :
        "center"
    const verticalPosition =
        visualRankIndex === 0 ? "top" :
        visualRankIndex === 7 ? "bottom" :
        "center"
    const left =
        horizontalPosition === "left" ? squareLeft :
        horizontalPosition === "right" ? squareLeft + SQUARE_SIZE :
        squareLeft + SQUARE_SIZE / 2
    const top =
        verticalPosition === "top" ? squareTop :
        verticalPosition === "bottom" ? squareTop + SQUARE_SIZE :
        squareTop + SQUARE_SIZE / 2
    const translateX =
        horizontalPosition === "left" ? "0" :
        horizontalPosition === "right" ? "-100%" :
        "-50%"
    const translateY =
        verticalPosition === "top" ? "0" :
        verticalPosition === "bottom" ? "-100%" :
        "-50%"

    return {
        left,
        top,
        transform: `translate(${translateX}, ${translateY})`,
    }
}
