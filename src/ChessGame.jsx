export default function ChessBoard() {
  const squares = [];
  for (let row = 8; row >= 1; row--) {
    for (let col = 1; col <= 8; col++) {
      const isBlack = (row + col) % 2 === 0;
      squares.push(
        <div
          key={`${row}-${col}`}
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: isBlack ? "black" : "white",
            display: "inline-block",
          }}
        />
      );
    }
  }
  return <div style={{ width: "400px", margin: "20px auto" }}>{squares}</div>;
}