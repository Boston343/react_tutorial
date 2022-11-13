import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={() => {
          this.props.onClick();
        }}
      >
        {this.props.value}
      </button>
    );
  }
}

// function component, simpler for components that only contain a "render" method
// it just takes props as input and returns what should be rendered
// Function components are less tediosu and many components can be expressed this way
// function Square(props) {
//   return (
//     <button className="square" onClick={props.onClick}>
//       <strong>{props.value}</strong>
//     </button>
//   );
// }

class Board extends React.Component {
  renderSquare(i) {
    var valueProp = this.props.squares[i];
    // if there is a winner, we need to give different value to winning squares
    if (this.props.win) {
      for (let j = 0; j < 3; j++) {
        if (this.props.win[j] === i) {
          valueProp = "W";
        }
      }
    }

    return (
      <Square
        value={valueProp} // pass value prop to Square component
        onClick={() => this.props.onClick(i)} // pass onClick prop to Square component
      />
    );
  }

  render() {
    // https://reactgo.com/react-for-loop/
    const boardSquares = [];
    for (let row = 0; row < 3; row++) {
      const boardRow = [];
      for (let col = 0; col < 3; col++) {
        boardRow.push(
          <span key={row * 3 + col}>{this.renderSquare(row * 3 + col)}</span>
        );
      }
      boardSquares.push(
        <div className="board-row" key={row}>
          {boardRow}
        </div>
      );
    }

    return <div>{boardSquares}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          col: Array(9).fill(null),
          row: Array(9).fill(null),
          win: Array(3).fill(null), // store the winning numbers
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      sortDescending: true,
    };
  }

  handleClick(i) {
    const rowMap = [1, 1, 1, 2, 2, 2, 3, 3, 3];
    const colMap = [1, 2, 3, 1, 2, 3, 1, 2, 3];

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    let current = history[history.length - 1];
    // create copy of the squares array to edit instead of editing OG
    const squares = current.squares.slice();
    // if someone already won, or if the space is filled, don't process click
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";

    // now check if we have a winner
    const winner = calculateWinner(squares);
    if (calculateWinner(squares)) {
      this.setState({
        history: history.concat([
          {
            squares: squares,
            col: colMap[i],
            row: rowMap[i],
            win: winner.squares,
          },
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    } else {
      this.setState({
        history: history.concat([
          {
            squares: squares,
            col: colMap[i],
            row: rowMap[i],
          },
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  swapOrder() {
    this.setState({
      sortDescending: !this.state.sortDescending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    // step is current history element value
    // move is current history element index
    let moves = history.map((step, move) => {
      const desc = move
        ? "Go to move #" + move + " @ (" + step.col + ", " + step.row + ")"
        : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <strong>{desc}</strong> : desc}
          </button>
        </li>
      );
    });

    // reverse the history moves order if we need to sort by ascending
    if (!this.state.sortDescending) {
      moves.reverse();
    }

    let status;
    if (winner) {
      status = "Winner: " + winner.player;
      // this.setState((history[this.state.stepNumber].win = winner.squares));
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    const swapOrder = (
      <button onClick={() => this.swapOrder()}>
        {this.state.sortDescending ? "Sort Ascending" : "Sort Descending"}
      </button>
    );

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            win={current.win}
          />
        </div>
        <div className="game-info">
          <div>{swapOrder}</div>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

// ========================================
// helper function to calculate if we have a winner of tic-tac-toe
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      const winner = {
        player: squares[a],
        squares: [a, b, c],
      };
      return winner;
    }
  }
  return null;
}
