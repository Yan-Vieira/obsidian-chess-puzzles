import { Chess } from "chess.js";
import { useMemo } from "react";
import type { Color } from "chessground/types"

export default function useCurrentCheck(
    chessInstance:Chess,
    currentColor:Color,
    positionKey:string
) {

    return useMemo(
        () => chessInstance.isCheck() ? currentColor : undefined,
        [chessInstance, currentColor, positionKey]
    )
}
