import { App, getAllTags, Notice, TFile, TFolder } from "obsidian";
import moment from "moment";
import { ChessPuzzlesSettings } from "settings";

export class PuzzlesService {

    app:App
    settings:ChessPuzzlesSettings

    constructor(app:App, settings:ChessPuzzlesSettings) {

        this.app = app
        this.settings = settings
    }

    public static calculateNextReview(
        reviewResult:ReviewResult, currentInterval:number = 0, currentEase:number = 2.5
    ) {

        const today = moment()
            
        let interval = currentInterval
        let ease = currentEase

        if (reviewResult === "again") {
            interval = 0;
            ease = Math.max(1.3, ease - 0.2)
        }

        if (reviewResult === "hard") {
            interval = Math.max(1, Math.round(interval * 1.2))
            ease = Math.max(1.3, ease - 0.15)
        }

        if (reviewResult === "good") {
            interval = interval <= 0 ? 1 : Math.round(interval * ease)
        }

        if (reviewResult === "easy") {
            interval = interval <= 0 ? 1 : Math.round(interval * ease * 1.3)
            ease = ease + 0.15
        }

        return {
            lastReview: today.format("YYYY-MM-DD"),
            nextReview: today.clone().add(interval, "days").format("YYYY-MM-DD"),
            ease: Math.round(ease * 100) / 100,
            interval,
        }
    }

    public static wasReviewedToday(lastReview?: string) {

        if (!lastReview) return false

        const lastReviewDate = moment(lastReview, "YYYY-MM-DD", true)

        if (!lastReviewDate.isValid()) return false

        return lastReviewDate.isSame(moment(), "day")
    }

    public async getAllPuzzles() {

        const puzzles:ChessPuzzle[] = []

        const markdownFiles = this.getDeckMarkdownFiles()

        for (const file of markdownFiles) {

            const cache = this.app.metadataCache.getFileCache(file)

            if (!cache) continue

            const tags = getAllTags(cache)

            if (!tags || !tags.some(tag => tag === "#chess-puzzles")) continue

           const content = await this.app.vault.read(file)
           
           const extracted = this.extractChessPuzzleBlocks(file, content)

           puzzles.push(...extracted)
        }

        return puzzles
    }

    public async getPendingPuzzles() {

        const puzzles:ChessPuzzle[] = []

        const markdownFiles = this.getDeckMarkdownFiles()

        for (const file of markdownFiles) {

            const cache = this.app.metadataCache.getFileCache(file)

            if (!cache) continue

            const tags = getAllTags(cache)

            if (!tags || !tags.some(tag => tag === "#chess-puzzles")) continue

           const content = await this.app.vault.read(file)
           
           const extracted = this.extractChessPuzzleBlocks(file, content)
           const today = moment().startOf("day")
           const pendingPuzzles = extracted.filter((puzzle) =>
                this.isReviewDue(puzzle.nextReview, today)
           )

           puzzles.push(...pendingPuzzles)
        }

        return puzzles
    }

    public async getAllDecks() {

        const decks:PuzzleDeck[] = []

        const markdownFiles = this.getDeckMarkdownFiles()

        for (const file of markdownFiles) {

            const cache = this.app.metadataCache.getFileCache(file)

            if (!cache) continue

            const tags = getAllTags(cache)

            if (!tags || !tags.some(tag => tag === "#chess-puzzles")) continue

           const content = await this.app.vault.read(file)
           
           const extracted = this.extractChessPuzzleBlocks(file, content)

           decks.push({
            name: file.basename,
            puzzles: extracted
           })
        }

        return decks
    }

    private isReviewDue(nextReview: string | undefined, today: moment.Moment) {

        if (!nextReview) return true

        const nextReviewDate = moment(nextReview, "YYYY-MM-DD", true)

        if (!nextReviewDate.isValid()) return false

        return nextReviewDate.isSameOrBefore(today, "day")
    }

    private getDeckMarkdownFiles() {

        const decksFolder = this.settings.decksFolder.trim()

        if (!decksFolder) return this.app.vault.getMarkdownFiles()

        const folder = this.app.vault.getFolderByPath(decksFolder)

        if (!folder) {

            new Notice("No decks found in the configured folder.")

            return []
        }

        return this.getMarkdownFilesInFolder(folder)
    }

    private getMarkdownFilesInFolder(folder: TFolder) {

        const markdownFiles: TFile[] = []
        const pendingFolders: TFolder[] = [folder]

        while (pendingFolders.length > 0) {

            const currentFolder = pendingFolders.pop()

            if (!currentFolder) continue

            for (const child of currentFolder.children) {

                if (child instanceof TFolder) {

                    pendingFolders.push(child)

                    continue
                }

                if (child instanceof TFile && child.extension === "md") {

                    markdownFiles.push(child)
                }
            }
        }

        return markdownFiles
    }

    public async updateReviewFields(puzzle: ChessPuzzle) {

        const file = this.app.vault.getAbstractFileByPath(puzzle.filePath)

        if (!(file instanceof TFile)) {
            throw new Error(`Chess puzzles error: file not found, ${puzzle.filePath}`)
        }

        const content = await this.app.vault.read(file)
        const lines = content.split("\n")
        const localizedPuzzle = this.localizePuzzleBlock(file, lines, puzzle)

        const updatedLines = this.updateChessPuzzleBlockReviewFields(lines, localizedPuzzle)
        const lineCountDelta = updatedLines.length - lines.length

        puzzle.blockStartLine = localizedPuzzle.blockStartLine
        puzzle.blockEndLine = localizedPuzzle.blockEndLine + lineCountDelta

        await this.app.vault.modify(file, updatedLines.join("\n"))
    }

    private extractChessPuzzleBlocks(file: TFile, content: string) {

        const puzzles: ChessPuzzle[] = []
        const lines = content.split("\n")

        let isInsideChessPuzzleBlock = false;
        let blockStartLine = 0;
        let blockContent: string[] = [];

        for (let i = 0; i < lines.length; i++) {

            const line = lines[i] ?? ""

            const trimmed = line.trim()

            if (!isInsideChessPuzzleBlock && trimmed === "```chess-puzzle") {

                isInsideChessPuzzleBlock = true;
                blockStartLine = i;
                blockContent = [];

                continue;
            }

            if (isInsideChessPuzzleBlock && line === "```") {
        
                const parsed = PuzzlesService.parseChessPuzzleBlock(blockContent.join("\n"));

                if (parsed && PuzzlesService.validateChessPuzzleBlock(parsed).length === 0) {

                    puzzles.push({
                        filePath: file.path,
                        blockStartLine,
                        blockEndLine: i,
                        ...parsed
                    });
                }

                isInsideChessPuzzleBlock = false;
                continue;
            }

            if (isInsideChessPuzzleBlock) {

                blockContent.push(line);
            }
        }

        return puzzles
    }

    private localizePuzzleBlock(file: TFile, lines: string[], puzzle: ChessPuzzle) {

        const puzzleAtStoredRange = this.getPuzzleAtLineRange(file, lines, puzzle.blockStartLine, puzzle.blockEndLine)

        if (puzzleAtStoredRange && this.isSamePuzzle(puzzleAtStoredRange, puzzle)) {

            return {
                ...puzzle,
                blockStartLine: puzzleAtStoredRange.blockStartLine,
                blockEndLine: puzzleAtStoredRange.blockEndLine,
            }
        }

        const matchingPuzzle = this.extractChessPuzzleBlocks(file, lines.join("\n"))
            .filter((candidate) => this.isSamePuzzle(candidate, puzzle))
            .sort((a, b) =>
                Math.abs(a.blockStartLine - puzzle.blockStartLine) -
                Math.abs(b.blockStartLine - puzzle.blockStartLine)
            )[0]

        if (!matchingPuzzle) {
            throw new Error("Chess puzzle block could not be found in the current file content.")
        }

        return {
            ...puzzle,
            blockStartLine: matchingPuzzle.blockStartLine,
            blockEndLine: matchingPuzzle.blockEndLine,
        }
    }

    private getPuzzleAtLineRange(file: TFile, lines: string[], blockStartLine: number, blockEndLine: number) {

        if (
            lines[blockStartLine]?.trim() !== "```chess-puzzle" ||
            lines[blockEndLine]?.trim() !== "```"
        ) {
            return undefined
        }

        const parsed = PuzzlesService.parseChessPuzzleBlock(
            lines.slice(blockStartLine + 1, blockEndLine).join("\n")
        )

        if (!parsed) return undefined

        return {
            filePath: file.path,
            blockStartLine,
            blockEndLine,
            ...parsed,
        }
    }

    private isSamePuzzle(candidate: ChessPuzzle, puzzle: ChessPuzzle) {

        const hasFen = puzzle.fen !== undefined
        const hasBestLine = Boolean(puzzle.bestLine?.length)

        if (!hasFen && !hasBestLine) return false

        if (hasFen && candidate.fen !== puzzle.fen) return false
        if (hasBestLine && !this.areBestLinesEqual(candidate.bestLine, puzzle.bestLine)) return false

        return true
    }

    private areBestLinesEqual(candidateBestLine?: string[], puzzleBestLine?: string[]) {

        if (!candidateBestLine || !puzzleBestLine) return false
        if (candidateBestLine.length !== puzzleBestLine.length) return false

        return candidateBestLine.every((move, index) => move === puzzleBestLine[index])
    }

    private updateChessPuzzleBlockReviewFields(lines: string[], puzzle: ChessPuzzle) {

        const updatedLines = [...lines]
        const reviewFields = this.getReviewFields(puzzle)
        const pendingFields = new Map(reviewFields)
        const blockContentStart = puzzle.blockStartLine + 1
        const blockContentEnd = puzzle.blockEndLine

        for (let i = blockContentStart; i < blockContentEnd; i++) {

            const key = this.getChessPuzzleBlockLineKey(updatedLines[i] ?? "")

            if (!key || !pendingFields.has(key)) continue

            const value = pendingFields.get(key)

            updatedLines[i] = `${key}: ${value}`
            pendingFields.delete(key)
        }

        const fieldsToAppend = Array.from(pendingFields.entries())
            .map(([key, value]) => `${key}: ${value}`)

        updatedLines.splice(blockContentEnd, 0, ...fieldsToAppend)

        return updatedLines
    }

    private getReviewFields(puzzle: ChessPuzzle): [string, string][] {

        const fields: [string, string][] = []

        if (puzzle.lastReview !== undefined) fields.push(["lastReview", puzzle.lastReview])
        if (puzzle.nextReview !== undefined) fields.push(["nextReview", puzzle.nextReview])
        if (puzzle.ease !== undefined) fields.push(["ease", String(puzzle.ease)])
        if (puzzle.interval !== undefined) fields.push(["interval", String(puzzle.interval)])

        return fields
    }

    private getChessPuzzleBlockLineKey(line: string) {

        const trimmed = line.trim()

        if (!trimmed || trimmed.startsWith("#")) return undefined

        const separatorIndex = trimmed.indexOf(":")

        if (separatorIndex === -1) return undefined

        return trimmed.slice(0, separatorIndex).trim()
    }

    public static parseChessPuzzleBlock(content: string): Partial<ChessPuzzle> | null {

        const data: Record<string, string> = {};

        for (const line of content.split("\n")) {

            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith("#")) continue;

            const separatorIndex = trimmed.indexOf(":");

            if (separatorIndex === -1) continue;

            const key = trimmed.slice(0, separatorIndex).trim();
            const value = trimmed.slice(separatorIndex + 1).trim();

            data[key] = value;
        }

        return {
            fen: data.fen,
            bestLine: PuzzlesService.parseBestLine(data.bestLine),
            lastReview: data.lastReview,
            nextReview: data.nextReview,
            ease: data.ease ? Number(data.ease) : undefined,
            interval: data.interval ? Number(data.interval) : undefined,
        };
    }

    public static validateChessPuzzleBlock(puzzle: Partial<ChessPuzzle> | null) {

        const warnings: string[] = []

        if (!puzzle?.fen?.trim()) {

            warnings.push("Missing required field: fen.")
        }

        if (!puzzle?.bestLine?.length) {

            warnings.push("Missing required field: bestLine.")
        }

        return warnings
    }

    private static parseBestLine (answer?: string) {

        if (!answer) return undefined

        return answer
            .split(",")
            .map((move) => move.trim())
            .filter((move) => move.length > 0)
    }
}

