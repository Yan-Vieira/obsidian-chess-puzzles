import { Chess } from "chess.js";
import { useMemo } from "react";
import toChessgroundColor from "./toChessgroundColor";

export default function useCurrentColor(chessInstance:Chess, positionKey:string) {

    return useMemo(
        () => toChessgroundColor(chessInstance.turn()),
        [chessInstance, positionKey]
    )
}
