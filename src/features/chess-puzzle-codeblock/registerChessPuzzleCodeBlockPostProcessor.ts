import { MarkdownPostProcessorContext, Plugin } from "obsidian"
import { PuzzlesService } from "services/PuzzlesService"
import ReviewPuzzleModal from "features/review-puzzle/ReviewPuzzleModal"
import { ReviewType } from "types/ReviewType"

export function registerChessPuzzleCodeBlockPostProcessor(plugin: Plugin) {

    plugin.registerMarkdownCodeBlockProcessor("chess-puzzle", (source, el, ctx) => {

        const puzzle = PuzzlesService.parseChessPuzzleBlock(source)
        const reviewPuzzle = createReviewPuzzle(source, el, ctx)

        el.empty()
        el.addClass("chess-puzzle-codeblock")

        renderField(el, "FEN", puzzle?.fen ?? "")
        renderField(el, "Next review", puzzle?.nextReview ?? "")

        const reviewButton = el.createEl("button", {
            cls: "chess-puzzle-codeblock-review-button",
            text: "Review",
        })

        reviewButton.disabled = !reviewPuzzle
        reviewButton.addEventListener("click", () => {

            if (!reviewPuzzle) return

            new ReviewPuzzleModal(
                plugin.app,
                ReviewType.SINGLE_PUZZLE,
                undefined,
                reviewPuzzle
            ).open()
        })
    })
}

function createReviewPuzzle(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
): ChessPuzzle | undefined {

    const puzzle = PuzzlesService.parseChessPuzzleBlock(source)

    if (!puzzle) return undefined

    const sectionInfo = ctx.getSectionInfo(el)

    return {
        filePath: ctx.sourcePath,
        blockStartLine: sectionInfo?.lineStart ?? 0,
        blockEndLine: sectionInfo?.lineEnd ?? 0,
        ...puzzle,
    }
}

function renderField(container: HTMLElement, label: string, value: string) {

    const row = container.createDiv({ cls: "chess-puzzle-codeblock-field" })
    row.createSpan({
        cls: "chess-puzzle-codeblock-label",
        text: `${label}: `,
    })
    row.createSpan({
        cls: "chess-puzzle-codeblock-value",
        text: value || "-",
    })
}
