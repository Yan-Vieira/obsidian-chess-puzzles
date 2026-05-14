import { Color } from "chess.js"
import type { Color as ChessgroundColor } from "chessground/types"

export default function toChessgroundColor (color:Color):ChessgroundColor {

    switch (color) {
        case "w": return "white";
        case "b": return "black"
    }
}