import React, { useState, useEffect, useRef, useCallback } from 'react';

const BOARD_SIZE = 19;
const LETTERS = "ABCDEFGHJKLMNOPQRST";

const customStyles = {
  body: {
    fontFamily: "'Fredoka', 'Nunito', sans-serif",
    backgroundColor: '#FFFBEA',
    backgroundImage: 'linear-gradient(45deg, #FFF8E1 25%, transparent 25%, transparent 75%, #FFF8E1 75%, #FFF8E1), linear-gradient(45deg, #FFF8E1 25%, transparent 25%, transparent 75%, #FFF8E1 75%, #FFF8E1)',
    backgroundSize: '60px 60px',
    backgroundPosition: '0 0, 30px 30px',
  },
  appContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1400px',
    height: '90vh',
    gap: '40px',
    padding: '0 40px',
  },
  gameBoardArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gameSidebar: {
    width: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: '320px',
  },
  modeSwitch: {
    background: '#FFFFFF',
    padding: '8px',
    borderRadius: '999px',
    display: 'flex',
    border: '3px solid #5D4037',
    boxShadow: '4px 4px 0px rgba(93, 64, 55, 0.15)',
  },
  modeOptionBase: {
    flex: 1,
    textAlign: 'center',
    padding: '10px 0',
    borderRadius: '999px',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#8D6E63',
    border: '2px solid transparent',
    fontFamily: "'Fredoka', sans-serif",
    background: 'transparent',
  },
  modeOptionActive: {
    background: '#FDD835',
    color: '#5D4037',
    border: '2px solid #5D4037',
    boxShadow: '2px 2px 0px rgba(93, 64, 55, 0.2)',
  },
  playerCard: {
    background: '#FFFFFF',
    borderRadius: '32px',
    padding: '20px',
    border: '3px solid #5D4037',
    boxShadow: '4px 4px 0px rgba(93, 64, 55, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s ease',
    position: 'relative',
  },
  playerCardActive: {
    background: '#FFF',
    transform: 'translateY(-4px)',
    boxShadow: '6px 6px 0px #5D4037',
    borderColor: '#5D4037',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarBase: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    border: '3px solid #5D4037',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarP1: { background: '#9CCC65', color: '#FFFFFF' },
  avatarP2: { background: '#D87A56', color: '#FFFFFF' },
  avatarAI: { background: '#8D6E63', color: '#FFFFFF' },
  playerInfo: { flex: 1 },
  playerInfoH2: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '4px',
    color: '#5D4037',
    fontFamily: "'Fredoka', sans-serif",
  },
  playerStatus: {
    display: 'flex',
    gap: '8px',
  },
  statusBadgeBase: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    background: '#FFF3E0',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#8D6E63',
    gap: '6px',
    border: '2px solid transparent',
  },
  statusBadgeDark: {
    background: '#5D4037',
    color: 'white',
  },
  timer: {
    fontVariantNumeric: 'tabular-nums',
    fontFamily: "'Nunito', sans-serif",
    fontSize: '26px',
    fontWeight: 800,
    color: '#5D4037',
    marginLeft: 'auto',
    background: '#FFF3E0',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  historyPanel: {
    background: '#FFFFFF',
    borderRadius: '32px',
    flex: 1,
    padding: '24px',
    border: '3px solid #5D4037',
    boxShadow: '4px 4px 0px rgba(93, 64, 55, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelHeader: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#5D4037',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moveList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '4px',
  },
  moveItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#FFFBEA',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#8D6E63',
    border: '1px solid rgba(93, 64, 55, 0.1)',
  },
  moveNum: {
    width: '28px',
    color: '#5D4037',
    fontSize: '14px',
    fontWeight: 700,
  },
  moveCoord: {
    color: '#5D4037',
    fontWeight: 700,
    marginLeft: 'auto',
    fontFamily: "'Nunito', monospace",
  },
  controls: {
    display: 'flex',
    gap: '16px',
  },
  btnBase: {
    flex: 1,
    padding: '16px',
    borderRadius: '20px',
    border: '3px solid #5D4037',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0px 4px 0px #5D4037',
    position: 'relative',
    top: 0,
  },
  btnSecondary: { background: '#FFFFFF', color: '#5D4037' },
  btnDanger: { background: '#D87A56', color: 'white' },
  btnPrimary: { background: '#FDD835', color: '#5D4037' },
  boardContainer: {
    background: '#EF8A78',
    borderRadius: '45px',
    padding: '30px',
    boxShadow: '8px 8px 0px rgba(93, 64, 55, 0.15), inset 4px 4px 0px rgba(255, 255, 255, 0.2), inset -4px -4px 0px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '3px solid #5D4037',
  },
  boardInner: {
    position: 'absolute',
    background: '#FFE082',
    borderRadius: '35px',
    border: '2px solid rgba(0,0,0,0.05)',
    zIndex: 0,
    top: '20px',
    left: '20px',
    right: '20px',
    bottom: '20px',
  },
  goBoard: {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
    gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
    width: '600px',
    height: '600px',
    position: 'relative',
    zIndex: 1,
  },
  gridLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  intersection: {
    position: 'relative',
    zIndex: 1,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stoneBlack: {
    width: '92%',
    height: '92%',
    borderRadius: '50%',
    background: '#3E2723',
    border: '2px solid #3E2723',
    boxShadow: '1px 2px 0px rgba(62, 39, 35, 0.3)',
    position: 'relative',
    zIndex: 2,
    animation: 'placeStone 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  },
  stoneWhite: {
    width: '92%',
    height: '92%',
    borderRadius: '50%',
    background: '#FAFAFA',
    border: '2px solid #E0E0E0',
    boxShadow: '1px 2px 0px rgba(62, 39, 35, 0.3)',
    position: 'relative',
    zIndex: 2,
    animation: 'placeStone 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  },
  lastMoveMarker: {
    width: '40%',
    height: '40%',
    borderRadius: '50%',
    position: 'absolute',
    zIndex: 3,
    top: '30%',
    left: '30%',
    background: '#D87A56',
    border: '2px solid white',
  },
  coordsTop: {
    position: 'absolute',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#5D4037',
    pointerEvents: 'none',
    zIndex: 2,
    top: '-35px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '0 16px',
  },
  coordsLeft: {
    position: 'absolute',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#5D4037',
    pointerEvents: 'none',
    zIndex: 2,
    left: '-35px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '16px 0',
  },
  blob1: {
    position: 'fixed',
    borderRadius: '50%',
    zIndex: -1,
    width: '200px',
    height: '200px',
    background: '#FDD835',
    bottom: '40px',
    right: '40px',
    border: '4px solid #5D4037',
    opacity: 0.2,
  },
  blob2: {
    position: 'fixed',
    borderRadius: '50%',
    zIndex: -1,
    width: '300px',
    height: '300px',
    background: '#9CCC65',
    top: '-60px',
    left: '-60px',
    border: '4px solid #5D4037',
    opacity: 0.15,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 251, 234, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalCard: {
    background: '#FFFFFF',
    padding: '40px',
    borderRadius: '40px',
    border: '3px solid #5D4037',
    boxShadow: '10px 10px 0px rgba(93, 64, 55, 0.15)',
    textAlign: 'center',
    maxWidth: '400px',
  },
};

const createEmptyBoard = () =>
  Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

function checkGroupLiberties(board, startX, startY, color, visitedRef, group) {
  const visited = visitedRef;
  visited[startY][startX] = true;
  group.push({ x: startX, y: startY });
  let hasLiberties = false;
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let ptr = 0;
  while (ptr < group.length) {
    const curr = group[ptr++];
    for (let d of directions) {
      const nx = curr.x + d[0];
      const ny = curr.y + d[1];
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (board[ny][nx] === null) {
          hasLiberties = true;
        } else if (board[ny][nx] === color && !visited[ny][nx]) {
          visited[ny][nx] = true;
          group.push({ x: nx, y: ny });
        }
      }
    }
  }
  return hasLiberties;
}

function getCapturedStones(board, color) {
  const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
  let captured = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === color && !visited[y][x]) {
        const group = [];
        const hasLibs = checkGroupLiberties(board, x, y, color, visited, group);
        if (!hasLibs) captured = captured.concat(group);
      }
    }
  }
  return captured;
}

const P1AvatarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);

const P2AvatarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AIAvatarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const HOSHI_POINTS = [
  [3, 3], [3, 9], [3, 15],
  [9, 3], [9, 9], [9, 15],
  [15, 3], [15, 9], [15, 15],
];

const GoBoard = ({ board, onIntersectionClick, lastMove }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  return (
    <div style={{ position: 'relative', width: '600px', height: '600px', zIndex: 1 }}>
      <div style={customStyles.coordsTop}>
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <span key={i}>{LETTERS[i]}</span>
        ))}
      </div>
      <div style={customStyles.coordsLeft}>
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <span key={i}>{BOARD_SIZE - i}</span>
        ))}
      </div>
      <div style={{ ...customStyles.goBoard, position: 'relative' }}>
        {/* Grid Layer */}
        <div style={customStyles.gridLayer}>
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div
              key={`v-${i}`}
              style={{
                position: 'absolute',
                left: `${(i / (BOARD_SIZE - 1)) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: '#5D4037',
                opacity: 0.6,
              }}
            />
          ))}
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: 'absolute',
                top: `${(i / (BOARD_SIZE - 1)) * 100}%`,
                left: 0,
                right: 0,
                height: '2px',
                background: '#5D4037',
                opacity: 0.6,
              }}
            />
          ))}
          {HOSHI_POINTS.map(([hx, hy], idx) => (
            <div
              key={`hoshi-${idx}`}
              style={{
                position: 'absolute',
                left: `${(hx / (BOARD_SIZE - 1)) * 100}%`,
                top: `${(hy / (BOARD_SIZE - 1)) * 100}%`,
                width: '10px',
                height: '10px',
                background: '#5D4037',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.8,
              }}
            />
          ))}
        </div>
        {/* Intersections */}
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => {
            const stone = board[y][x];
            const isLastMove = lastMove && lastMove.x === x && lastMove.y === y;
            const isHovered = hoveredCell && hoveredCell.x === x && hoveredCell.y === y;
            return (
              <div
                key={`${x}-${y}`}
                style={customStyles.intersection}
                onClick={() => onIntersectionClick(x, y)}
                onMouseEnter={() => setHoveredCell({ x, y })}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {!stone && isHovered && (
                  <div
                    style={{
                      width: '50%',
                      height: '50%',
                      background: 'rgba(93, 64, 55, 0.2)',
                      borderRadius: '50%',
                    }}
                  />
                )}
                {stone && (
                  <div style={stone === 'black' ? customStyles.stoneBlack : customStyles.stoneWhite}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '15%',
                        left: '15%',
                        width: '25%',
                        height: '25%',
                        borderRadius: '50%',
                        background: stone === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                      }}
                    />
                    {isLastMove && <div style={customStyles.lastMoveMarker} />}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const App = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [moveCount, setMoveCount] = useState(0);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [gameMode, setGameMode] = useState('local');
  const [isGameOver, setIsGameOver] = useState(false);
  const [timers, setTimers] = useState({ black: 900, white: 900 });
  const [lastMove, setLastMove] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [winnerText, setWinnerText] = useState('');
  const [aiThinking, setAiThinking] = useState(false);

  const currentPlayerRef = useRef(currentPlayer);
  const isGameOverRef = useRef(isGameOver);
  const boardRef = useRef(board);
  const capturesRef = useRef(captures);
  const moveCountRef = useRef(moveCount);
  const gameModeRef = useRef(gameMode);

  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { capturesRef.current = captures; }, [captures]);
  useEffect(() => { moveCountRef.current = moveCount; }, [moveCount]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

  const moveListRef = useRef(null);

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isGameOverRef.current) return;
      setTimers(prev => {
        const cp = currentPlayerRef.current;
        const newVal = prev[cp] - 1;
        const updated = { ...prev, [cp]: newVal };
        if (newVal <= 0) {
          clearInterval(timerRef.current);
          const winner = cp === 'black' ? 'White' : 'Black';
          setWinnerText(`${winner} wins by timeout.`);
          setIsGameOver(true);
        }
        return updated;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@700;800&display=swap');
      @keyframes placeStone {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
      body { margin: 0; overflow: hidden; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const doPlaceStone = useCallback((x, y, player, currentBoard, currentCaptures, currentMoveCount) => {
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[y][x] = player;

    const opponent = player === 'black' ? 'white' : 'black';
    const capturedOpponent = getCapturedStones(newBoard, opponent);
    const suicideCheck = getCapturedStones(newBoard, player);

    if (suicideCheck.length > 0 && capturedOpponent.length === 0) {
      return null;
    }

    let newCaptures = { ...currentCaptures };
    if (capturedOpponent.length > 0) {
      capturedOpponent.forEach(pt => { newBoard[pt.y][pt.x] = null; });
      newCaptures[player] = currentCaptures[player] + capturedOpponent.length;
    }

    const newMoveCount = currentMoveCount + 1;
    const coord = `${LETTERS[x]}${BOARD_SIZE - y}`;

    return { newBoard, newCaptures, newMoveCount, coord };
  }, []);

  const handleIntersectionClick = useCallback((x, y) => {
    if (isGameOverRef.current) return;
    if (boardRef.current[y][x] !== null) return;
    if (aiThinking) return;

    const player = currentPlayerRef.current;
    const result = doPlaceStone(x, y, player, boardRef.current, capturesRef.current, moveCountRef.current);
    if (!result) return;

    const { newBoard, newCaptures, newMoveCount, coord } = result;

    setBoard(newBoard);
    setCaptures(newCaptures);
    setMoveCount(newMoveCount);
    setLastMove({ x, y });
    setMoveHistory(prev => [...prev, { num: newMoveCount, player, coord, type: 'move' }]);

    const nextPlayer = player === 'black' ? 'white' : 'black';
    setCurrentPlayer(nextPlayer);

    if (gameModeRef.current === 'ai' && nextPlayer === 'white') {
      setAiThinking(true);
      setTimeout(() => {
        const curBoard = newBoard;
        let placed = false;
        let attempts = 0;
        let aiX = -1, aiY = -1;
        while (!placed && attempts < 200) {
          const rx = Math.floor(Math.random() * BOARD_SIZE);
          const ry = Math.floor(Math.random() * BOARD_SIZE);
          if (curBoard[ry][rx] === null) {
            const aiResult = doPlaceStone(rx, ry, 'white', curBoard, newCaptures, newMoveCount);
            if (aiResult) {
              aiX = rx; aiY = ry;
              setBoard(aiResult.newBoard);
              setCaptures(aiResult.newCaptures);
              setMoveCount(aiResult.newMoveCount);
              setLastMove({ x: rx, y: ry });
              setMoveHistory(prev => [...prev, { num: aiResult.newMoveCount, player: 'white', coord: aiResult.coord, type: 'move' }]);
              setCurrentPlayer('black');
              placed = true;
            }
          }
          attempts++;
        }
        if (!placed) {
          setMoveHistory(prev => [...prev, { num: newMoveCount + 1, player: 'white', coord: 'Pass', type: 'pass' }]);
          setCurrentPlayer('black');
        }
        setAiThinking(false);
      }, 500);
    }
  }, [doPlaceStone, aiThinking]);

  const handlePass = () => {
    if (isGameOver) return;
    const player = currentPlayerRef.current;
    const newMoveCount = moveCountRef.current + 1;
    setMoveHistory(prev => [...prev, { num: newMoveCount, player, coord: 'Pass', type: 'pass' }]);
    setMoveCount(newMoveCount);
    setCurrentPlayer(player === 'black' ? 'white' : 'black');
  };

  const handleResign = () => {
    if (isGameOver) return;
    const winner = currentPlayerRef.current === 'black' ? 'White' : 'Black';
    setWinnerText(`${winner} wins by resignation.`);
    setIsGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setMoveCount(0);
    setCaptures({ black: 0, white: 0 });
    setTimers({ black: 900, white: 900 });
    setIsGameOver(false);
    setLastMove(null);
    setMoveHistory([]);
    setWinnerText('');
    setAiThinking(false);
    startTimer();
  };

  const handleSetMode = (mode) => {
    setGameMode(mode);
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setMoveCount(0);
    setCaptures({ black: 0, white: 0 });
    setTimers({ black: 900, white: 900 });
    setIsGameOver(false);
    setLastMove(null);
    setMoveHistory([]);
    setWinnerText('');
    setAiThinking(false);
    startTimer();
  };

  const isP1Active = currentPlayer === 'black' && !isGameOver;
  const isP2Active = currentPlayer === 'white' && !isGameOver;

  return (
    <div
      style={{
        ...customStyles.body,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={customStyles.blob1} />
      <div style={customStyles.blob2} />

      <div style={customStyles.appContainer}>
        {/* Board Area */}
        <main style={customStyles.gameBoardArea}>
          <div style={customStyles.boardContainer}>
            <div style={customStyles.boardInner} />
            <GoBoard board={board} onIntersectionClick={handleIntersectionClick} lastMove={lastMove} />
          </div>
        </main>

        {/* Sidebar */}
        <aside style={customStyles.gameSidebar}>
          {/* Mode Switch */}
          <div style={customStyles.modeSwitch}>
            {['local', 'ai'].map(mode => (
              <button
                key={mode}
                onClick={() => handleSetMode(mode)}
                style={{
                  ...customStyles.modeOptionBase,
                  ...(gameMode === mode ? customStyles.modeOptionActive : {}),
                }}
              >
                {mode === 'local' ? 'Local' : 'Versus AI'}
              </button>
            ))}
          </div>

          {/* Player 1 Card */}
          <div
            style={{
              ...customStyles.playerCard,
              ...(isP1Active ? customStyles.playerCardActive : {}),
            }}
          >
            {isP1Active && (
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '20px',
                  width: '30px',
                  height: '30px',
                  background: '#D87A56',
                  backgroundImage: 'radial-gradient(circle, #fff 20%, transparent 20%)',
                  backgroundSize: '5px 5px',
                  borderRadius: '50%',
                  border: '3px solid #5D4037',
                  zIndex: 10,
                }}
              />
            )}
            <div style={customStyles.playerHeader}>
              <div style={{ ...customStyles.avatarBase, ...customStyles.avatarP1 }}>
                <P1AvatarIcon />
              </div>
              <div style={customStyles.playerInfo}>
                <h2 style={customStyles.playerInfoH2}>You</h2>
                <div style={customStyles.playerStatus}>
                  <div style={{ ...customStyles.statusBadgeBase, ...customStyles.statusBadgeDark }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)', background: '#FAFAFA' }} />
                    <span>{captures.black}</span>
                  </div>
                  <div style={customStyles.statusBadgeBase}>Black</div>
                </div>
              </div>
              <div style={customStyles.timer}>{formatTime(timers.black)}</div>
            </div>
          </div>

          {/* Player 2 Card */}
          <div
            style={{
              ...customStyles.playerCard,
              ...(isP2Active ? customStyles.playerCardActive : {}),
            }}
          >
            {isP2Active && (
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '20px',
                  width: '30px',
                  height: '30px',
                  background: '#D87A56',
                  backgroundImage: 'radial-gradient(circle, #fff 20%, transparent 20%)',
                  backgroundSize: '5px 5px',
                  borderRadius: '50%',
                  border: '3px solid #5D4037',
                  zIndex: 10,
                }}
              />
            )}
            <div style={customStyles.playerHeader}>
              <div
                style={{
                  ...customStyles.avatarBase,
                  ...(gameMode === 'ai' ? customStyles.avatarAI : customStyles.avatarP2),
                }}
              >
                {gameMode === 'ai' ? <AIAvatarIcon /> : <P2AvatarIcon />}
              </div>
              <div style={customStyles.playerInfo}>
                <h2 style={customStyles.playerInfoH2}>{gameMode === 'ai' ? 'AlphaGo' : 'Player 2'}</h2>
                <div style={customStyles.playerStatus}>
                  <div style={{ ...customStyles.statusBadgeBase, ...customStyles.statusBadgeDark }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)', background: '#3E2723' }} />
                    <span>{captures.white}</span>
                  </div>
                  <div style={customStyles.statusBadgeBase}>White</div>
                </div>
              </div>
              <div style={customStyles.timer}>{formatTime(timers.white)}</div>
            </div>
          </div>

          {/* History Panel */}
          <div style={customStyles.historyPanel}>
            <div style={customStyles.panelHeader}>
              <span>History</span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#8D6E63',
                  background: '#FFF3E0',
                  padding: '6px 10px',
                  borderRadius: '99px',
                  fontWeight: 700,
                }}
              >
                Moves: {moveCount}
              </span>
            </div>
            <div style={customStyles.moveList} ref={moveListRef}>
              <div style={{ ...customStyles.moveItem, justifyContent: 'center', opacity: 0.7, fontWeight: 500 }}>
                Game started
              </div>
              {moveHistory.map((move, idx) => (
                <div key={idx} style={customStyles.moveItem}>
                  <span style={customStyles.moveNum}>{move.num}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        display: 'inline-block',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: move.player === 'black' ? '#3E2723' : '#FAFAFA',
                        flexShrink: 0,
                      }}
                    />
                    <span>{move.player === 'black' ? 'Black' : 'White'}</span>
                  </div>
                  <span
                    style={{
                      ...customStyles.moveCoord,
                      ...(move.type === 'pass' ? { color: '#BCAAA4' } : {}),
                    }}
                  >
                    {move.coord}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div style={customStyles.controls}>
            <button
              style={{ ...customStyles.btnBase, ...customStyles.btnSecondary }}
              onClick={handlePass}
            >
              Pass
            </button>
            <button
              style={{ ...customStyles.btnBase, ...customStyles.btnDanger }}
              onClick={handleResign}
            >
              Resign
            </button>
          </div>
        </aside>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div style={customStyles.modalOverlay}>
          <div style={customStyles.modalCard}>
            <h2
              style={{
                fontSize: '32px',
                marginBottom: '12px',
                color: '#5D4037',
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              Game Over!
            </h2>
            <p
              style={{
                color: '#8D6E63',
                marginBottom: '32px',
                lineHeight: 1.5,
                fontSize: '18px',
              }}
            >
              {winnerText}
            </p>
            <button
              style={{
                ...customStyles.btnBase,
                ...customStyles.btnPrimary,
                width: '100%',
              }}
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;