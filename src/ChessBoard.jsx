import { useState, useRef } from "react";
import { Chess } from "chess.js";

export default function ChessBoard() {
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  const [fen, setFen] = useState(chess.fen());
  const [legalMoves, setLegalMoves] = useState([]);
  const [draggingSquare, setDraggingSquare] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const pieceImages = {
    P: "https://chessboardjs.com/img/chesspieces/wikipedia/wP.png",
    R: "https://chessboardjs.com/img/chesspieces/wikipedia/wR.png",
    N: "https://chessboardjs.com/img/chesspieces/wikipedia/wN.png",
    B: "https://chessboardjs.com/img/chesspieces/wikipedia/wB.png",
    Q: "https://chessboardjs.com/img/chesspieces/wikipedia/wQ.png",
    K: "https://chessboardjs.com/img/chesspieces/wikipedia/wK.png",
    p: "https://chessboardjs.com/img/chesspieces/wikipedia/bP.png",
    r: "https://chessboardjs.com/img/chesspieces/wikipedia/bR.png",
    n: "https://chessboardjs.com/img/chesspieces/wikipedia/bN.png",
    b: "https://chessboardjs.com/img/chesspieces/wikipedia/bB.png",
    q: "https://chessboardjs.com/img/chesspieces/wikipedia/bQ.png",
    k: "https://chessboardjs.com/img/chesspieces/wikipedia/bK.png",
  };

  const fenToBoard = (fen) => {
    const rows = fen.split(" ")[0].split("/");
    return rows.map((row) => {
      const squares = [];
      for (const char of row) {
        if (isNaN(char)) {
          squares.push(pieceImages[char]);
        } else {
          for (let i = 0; i < parseInt(char); i++) squares.push(null);
        }
      }
      return squares;
    });
  };

  const board = fenToBoard(fen);
  const toSquare = (row, col) => "abcdefgh"[col] + (8 - row);

  // DRAG-AND-DROP
  const handleDragStart = (row, col) => {
    const square = toSquare(row, col);
    const piece = board[row][col];
    if (!piece) return;

    const pieceLetter = Object.keys(pieceImages).find((key) => pieceImages[key] === piece);
    const turn = chess.turn();
    if ((turn === "w" && pieceLetter === pieceLetter.toUpperCase()) ||
        (turn === "b" && pieceLetter === pieceLetter.toLowerCase())) {
      setDraggingSquare(square);
      const moves = chess.moves({ square, verbose: true }).map(m => m.to);
      setLegalMoves(moves);
    }
  };

  const handleDrop = (row, col) => {
    const targetSquare = toSquare(row, col);
    if (draggingSquare && legalMoves.includes(targetSquare)) {
      chess.move({ from: draggingSquare, to: targetSquare, promotion: "q" });
      setFen(chess.fen());
    }
    setDraggingSquare(null);
    setLegalMoves([]);
  };

  // CLICK-TO-MOVE
  const handleSquareClick = (row, col) => {
    const square = toSquare(row, col);
    const piece = board[row][col];
    const turn = chess.turn();

    // Selecting a piece
    if (piece) {
      const pieceLetter = Object.keys(pieceImages).find((key) => pieceImages[key] === piece);
      if ((turn === "w" && pieceLetter === pieceLetter.toUpperCase()) ||
          (turn === "b" && pieceLetter === pieceLetter.toLowerCase())) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true }).map(m => m.to);
        setLegalMoves(moves);
        return;
      }
    }

    // Moving a piece
    if (selectedSquare && legalMoves.includes(square)) {
      chess.move({ from: selectedSquare, to: square, promotion: "q" });
      setFen(chess.fen());
    }

    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const isLegal = (row, col) => legalMoves.includes(toSquare(row, col));

  // Move history
  const history = chess.history({ verbose: true });
  const pairedHistory = [];
  for (let i = 0; i < history.length; i += 2) {
    const moveNumber = i / 2 + 1;
    const whiteMove = history[i]?.san || "";
    const blackMove = history[i + 1]?.san || "";
    pairedHistory.push(`${moveNumber}. ${whiteMove}${blackMove ? " " + blackMove : ""}`);
  }

  const bgColor = darkMode ? "#1c1c1c" : "#f5f5f5";
  const moveHistoryBg = darkMode ? "#2a2a2a" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: bgColor,
        padding: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: darkMode ? "#2b2b2b" : "#f5f5f5",
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        {/* Chessboard */}
        <div
          style={{
            width: "min(480px, 90vw)",
            aspectRatio: "1/1",
            display: "grid",
            gridTemplateRows: "repeat(8, 1fr)",
            gridTemplateColumns: "repeat(8, 1fr)",
          }}
        >
          {board.map((rowArr, rowIndex) =>
            rowArr.map((piece, colIndex) => {
              const isBlue = (rowIndex + colIndex) % 2 === 0;
              const legalHighlight = isLegal(rowIndex, colIndex);

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(rowIndex, colIndex)}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: isBlue ? "#5084b2" : "#ffffff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    border: "1px solid gray",
                  }}
                >
                  {piece && (
                    <img
                      src={piece}
                      alt=""
                      draggable={true}
                      onDragStart={() => handleDragStart(rowIndex, colIndex)}
                      style={{
                        width: "80%",
                        height: "80%",
                        maxWidth: "60px",
                        maxHeight: "60px",
                        cursor: "grab",
                      }}
                    />
                  )}
                  {legalHighlight && !piece && (
                    <div
                      style={{
                        width: "20%",
                        height: "20%",
                        backgroundColor: "#1E90FF",
                        borderRadius: "50%",
                        position: "absolute",
                      }}
                    />
                  )}
                  {rowIndex === 7 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px",
                        fontSize: "10px",
                        color: isBlue ? "#ffffff" : "#000000",
                        fontWeight: "bold",
                      }}
                    >
                      {"abcdefgh"[colIndex]}
                    </div>
                  )}
                  {colIndex === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "2px",
                        fontSize: "10px",
                        color: isBlue ? "#ffffff" : "#000000",
                        fontWeight: "bold",
                      }}
                    >
                      {8 - rowIndex}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Move History */}
        <div
          style={{
            flex: "1 1 200px",
            minWidth: "180px",
            maxHeight: "500px",
            overflowY: "auto",
            backgroundColor: moveHistoryBg,
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            color: textColor,
            fontFamily: "monospace",
          }}
        >
          <h3 style={{ textAlign: "center", color: textColor }}>Move History</h3>
          <ol>
            {pairedHistory.map((move, index) => (
              <li key={index}>{move}</li>
            ))}
          </ol>
        </div>

        {/* Dark/Light toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            backgroundColor: darkMode ? "#ffffff" : "#1c1c1c",
            color: darkMode ? "#000000" : "#ffffff",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
}
