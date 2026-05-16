# ♟️ Chess Puzzles

> Train chess patterns inside Obsidian with your own puzzles and spaced repetition.

An Obsidian plugin that lets you create and review chess puzzles (like the chess problems in Lichess and Chess.com) directly in Markdown notes.

## ❤️ Motivation

Instead of relying only on public puzzle databases, the plugin encourages players to build a personal collection of patterns extracted from:

- their own games;
- opening preparation;
- tactical mistakes;
- endgame studies;
- memorable positions.

## ✨ Features

- Create chess puzzles with simple Markdown syntax;
- Review puzzles with a spaced repetition system (SRS);
- Four review modes:
    - Single puzzle;
    - Single deck;
    - Pending puzzles only;
    - All puzzles in vault.
- Fully portable puzzles:
    - Review history/scheduling is stored inside the Markdown block;
    - Move puzzles between vaults without losing progress.

## 📝 Usage

### Creating a deck

A deck is a note where the plugin search for puzzles.

To declare a deck, simply add the `#chess-puzzles` tag in the note frontmatter. You can create as many decks as you want.

### Creating a puzzle

Write a `chess-puzzle` codeblock inside the deck:

~~~
```chess-puzzle
fen: 6k1/P3rppp/1Q6/4q3/7P/6P1/1R3P1K/8 w - - 0 1
bestLine: Qb8+, Re8, Qxe8+, Qxe8, Rb8, Qxb8, axb8=Q+
```
~~~

**Fields**

- **fen:** starting position in [Forsyth-Edwards Notation](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation);
- **bestLine:** sequence of moves separated by commas. Even moves belongs to the player; odd moves belongs to the opponent.

## ♻️ Reviewing puzzles

### Reviewing a single puzzle

After creating a puzzle, click the button shown in the rendered preview.

### Reviewing a single deck

1. Open the command palette (`Ctrl + P`);
2. Run `Chess Puzzles: select a deck to review`;
3. Select the deck you want to review.

### Reviewing only pending puzzles

1. Open the command palette (`Ctrl + P`);
2. Run `Chess Puzzles: review pending puzzles`.

Only puzzles whose `nextReview` date is due will appear.

### Reviewing all puzzles inside vault

1. Open the command palette (`Ctrl + P`);
2. Run `Chess Puzzles: review all puzzles`.

## ⏱️ Spaced Repetition System

After solving a puzzle, choose one of the following review ratings:

- Again
- Hard
- Good
- Easy

The plugin automatically recalculates the next review date and updates the puzzle block with scheduling info.

## 🤝 Contributing

Feedback, suggestions, and bug reports are welcome!

Please raise an issue on the [GitHub repository](https://github.com/Yan-Vieira/obsidian-chess-puzzles).