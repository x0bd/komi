import React, { useState, useEffect, useRef, useCallback } from 'react';

const BOARD_SIZE = 19;
const LETTERS = "ABCDEFGHJKLMNOPQRST";

const customStyles = {
  body: {
    fontFamily: "'Fredoka', sans-serif",
    background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
    color: '#5D2E2E',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1400px',
    height: '90vh',
    gap: '40px',
    padding: '0 40px',
    position: 'relative',
    zIndex: 10,
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
    gap: '24px',
    minWidth: '320px',
  },
  modeSwitch: {
    background: 'rgba(255, 255, 255, 0.6)',
    padding: '6px',
    borderRadius: '999px',
    display: 'flex',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    backdropFilter: 'blur(8px)',
    border: '2px solid rgba(255,255,255,0.8)',
  },
  modeOptionBase: {
    flex: 1,
    textAlign: 'center',
    padding: '12px 0',
    borderRadius: '999px',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    color: '#9C5555',
    fontFamily: "'Fredoka', sans-serif",
    border: 'none',
    background: 'transparent',
  },
  modeOptionActive: {
    background: '#5D2E2E',
    color: '#FFFDF7',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(93, 46, 46, 0.3)',
  },
  playerCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '32px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(186, 74, 74, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
    border: '3px solid transparent',
    backdropFilter: 'blur(10px)',
  },
  playerCardActive: {
    borderColor: '#FF8C42',
    background: '#FFFFFF',
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(255, 140, 66, 0.2)',
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
    boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1)',
    flexShrink: 0,
  },
  avatarP1: { background: '#FFDAC1', color: '#944600' },
  avatarP2: { background: '#FFB7B2', color: '#822020' },
  avatarAI: { background: '#FFE4D6', color: '#9C5555' },
  playerInfo: { flex: 1 },
  playerInfoH2: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '6px',
    color: '#5D2E2E',
    letterSpacing: '0.5px',
    fontFamily: "'Fredoka', sans-serif",
  },
  playerStatus: { display: 'flex', gap: '8px' },
  statusBadgeBase: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    background: '#FFE4D6',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#9C5555',
    gap: '6px',
  },
  statusBadgeDark: {
    background: '#5D2E2E',
    color: 'white',
  },
  timer: {
    fontVariantNumeric: 'tabular-nums',
    fontSize: '26px',
    fontWeight: 700,
    color: '#5D2E2E',
    marginLeft: 'auto',
    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
    fontFamily: "'Fredoka', sans-serif",
  },
  historyPanel: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '32px',
    flex: 1,
    padding: '24px',
    boxShadow: '0 10px 40px rgba(186, 74, 74, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '2px solid white',
  },
  panelHeader: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#5D2E2E',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'Fredoka', sans-serif",
  },
  moveCountBadge: {
    fontSize: '13px',
    color: '#9C5555',
    background: '#FFF0E6',
    padding: '6px 12px',
    borderRadius: '99px',
    fontWeight: 700,
    fontFamily: "'Fredoka', sans-serif",
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
    padding: '12px 16px',
    background: '#FFF0E6',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#9C5555',
  },
  moveNum: {
    width: '28px',
    color: '#E68A73',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: "'Fredoka', sans-serif",
  },
  moveCoord: {
    color: '#5D2E2E',
    fontWeight: 700,
    marginLeft: 'auto',
    fontFamily: "'Fredoka', sans-serif",
  },
  controls: { display: 'flex', gap: '16px' },
  btnBase: {
    flex: 1,
    padding: '18px',
    borderRadius: '20px',
    border: 'none',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
  btnSecondary: {
    background: '#FFFFFF',
    color: '#9C5555',
    boxShadow: '0 4px 10px rgba(156, 85, 85, 0.15)',
  },
  btnDanger: {
    background: '#D32F2F',
    color: 'white',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
  },
  boardContainer: {
    background: '#FFF0E0',
    borderRadius: '48px',
    padding: '40px',
    boxShadow: '0 30px 60px rgba(93, 46, 46, 0.1), inset 0 0 0 10px rgba(255, 255, 255, 0.6)',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBoard: {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
    gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
    gap: 0,
    width: '600px',
    height: '600px',
    position: 'relative',
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
    boxShadow: '2px 4px 6px rgba(62, 39, 35, 0.25)',
    zIndex: 2,
    background: 'radial-gradient(circle at 30% 30%, #5D4037, #3E2723)',
    position: 'relative',
    animation: 'placeStone 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  },
  stoneWhite: {
    width: '92%',
    height: '92%',
    borderRadius: '50%',
    boxShadow: '2px 4px 6px rgba(62, 39, 35, 0.25)',
    zIndex: 2,
    background: 'radial-gradient(circle at 30% 30%, #FFFFFF, #FFF5E8)',
    border: '1px solid rgba(0,0,0,0.05)',
    position: 'relative',
    animation: 'placeStone 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  },
  lastMoveMarker: {
    width: '35%',
    height: '35%',
    borderRadius: '50%',
    position: 'absolute',
    zIndex: 3,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#FF7043',
    boxShadow: '0 0 4px #FF7043',
  },
  coordsTop: {
    position: 'absolute',
    top: '-30px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '0 16px',
    fontSize: '14px',
    fontWeight: 700,
    color: '#C09080',
    pointerEvents: 'none',
    fontFamily: "'Fredoka', sans-serif",
  },
  coordsLeft: {
    position: 'absolute',
    left: '-30px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '16px 0',
    fontSize: '14px',
    fontWeight: 700,
    color: '#C09080',
    pointerEvents: 'none',
    fontFamily: "'Fredoka', sans-serif",
  },
  modalOverlayBase: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 192, 203, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    transition: 'opacity 0.3s',
  },
  modalCard: {
    background: '#FFFFFF',
    padding: '48px',
    borderRadius: '40px',
    boxShadow: '0 30px 80px rgba(93, 46, 46, 0.2)',
    textAlign: 'center',
    maxWidth: '420px',
    border: '4px solid #FFF0E0',
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    fontFamily: "'Fredoka', sans-serif",
  },
};

const StoneIcon = ({ color }) => (
  <span style={{
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    background: color === 'black' ? '#3E2723' : '#FFFFFF',
    border: color === 'white' ? '1px solid rgba(0,0,0,0.1)' : 'none',
    flexShrink: 0,
  }} />
);

const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);

const GroupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

function initBoard() {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function checkGroupLiberties(board, x, y, color, visited, group) {
  visited[y][x] = true;
  group.push({ x, y });
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
        const hasLiberties = checkGroupLiberties(board, x, y, color, visited, group);
        if (!hasLiberties) {
          captured = captured.concat(group);
        }
      }
    }
  }
  return captured;
}

const GridLayer = () => {
  const hoshiPoints = [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15]
  ];
  return (
    <div style={customStyles.gridLayer}>
      {Array.from({ length: BOARD_SIZE }).map((_, i) => (
        <div key={`v${i}`} style={{
          background: '#8D5B4C',
          position: 'absolute',
          left: `${(i / (BOARD_SIZE - 1)) * 100}%`,
          top: 0,
          bottom: 0,
          width: '1px',
          opacity: 0.5,
        }} />
      ))}
      {Array.from({ length: BOARD_SIZE }).map((_, i) => (
        <div key={`h${i}`} style={{
          background: '#8D5B4C',
          position: 'absolute',
          top: `${(i / (BOARD_SIZE - 1)) * 100}%`,
          left: 0,
          right: 0,
          height: '1px',
          opacity: 0.5,
        }} />
      ))}
      {hoshiPoints.map(([hx, hy], i) => (
        <div key={`hoshi${i}`} style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          background: '#8D5B4C',
          borderRadius: '50%',
          left: `${(hx / (BOARD_SIZE - 1)) * 100}%`,
          top: `${(hy / (BOARD_SIZE - 1)) * 100}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }} />
      ))}
    </div>
  );
};

const Stone = ({ color, isLast }) => {
  const stoneStyle = color === 'black' ? customStyles.stoneBlack : customStyles.stoneWhite;
  return (
    <div style={stoneStyle}>
      <div style={{
        content: '',
        position: 'absolute',
        top: '15%',
        left: '15%',
        width: '25%',
        height: '12%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.4)',
        transform: 'rotate(-45deg)',
      }} />
      {isLast && <div style={customStyles.lastMoveMarker} />}
    </div>
  );
};

const Intersection = ({ x, y, stone, isLast, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={customStyles.intersection}
      onClick={() => onClick(x, y)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!stone && hovered && (
        <div style={{
          width: '50%',
          height: '50%',
          background: 'rgba(255, 112, 67, 0.2)',
          borderRadius: '50%',
        }} />
      )}
      {stone && <Stone color={stone} isLast={isLast} />}
    </div>
  );
};

const App = () => {
  const [board, setBoard] = useState(initBoard);
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [moveCount, setMoveCount] = useState(0);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [gameMode, setGameMode] = useState('local');
  const [isGameOver, setIsGameOver] = useState(false);
  const [timers, setTimers] = useState({ black: 900, white: 900 });
  const [lastMove, setLastMove] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [winnerText, setWinnerText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalScale, setModalScale] = useState(false);

  const currentPlayerRef = useRef(currentPlayer);
  const isGameOverRef = useRef(isGameOver);
  const boardRef = useRef(board);
  const gameModeRef = useRef(gameMode);
  const timersRef = useRef(timers);
  const moveCountRef = useRef(moveCount);
  const capturesRef = useRef(captures);
  const timerInterval = useRef(null);
  const moveListRef = useRef(null);
  const aiTimeout = useRef(null);

  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { timersRef.current = timers; }, [timers]);
  useEffect(() => { moveCountRef.current = moveCount; }, [moveCount]);
  useEffect(() => { capturesRef.current = captures; }, [captures]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap');
      @keyframes placeStone {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
      body {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      * { box-sizing: border-box; }
      .move-list-scroll::-webkit-scrollbar { width: 6px; }
      .move-list-scroll::-webkit-scrollbar-thumb { background-color: #FFCCBC; border-radius: 10px; }
      .move-item-hover:hover { background: #FFE0CC !important; }
      .btn-secondary-hover:hover { background: #f5f5f5; }
      .btn-danger-hover:hover { background: #b71c1c; }
      .btn-active:active { transform: scale(0.95) !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const endGame = useCallback((winner, reason) => {
    setIsGameOver(true);
    clearInterval(timerInterval.current);
    setWinnerText(`<strong>${winner}</strong> wins by ${reason}.`);
    setModalVisible(true);
    setTimeout(() => setModalScale(true), 10);
  }, []);

  useEffect(() => {
    clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      if (isGameOverRef.current) return;
      const cp = currentPlayerRef.current;
      setTimers(prev => {
        const next = { ...prev, [cp]: prev[cp] - 1 };
        if (next[cp] <= 0) {
          endGame(cp === 'black' ? 'White' : 'Black', 'timeout');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerInterval.current);
  }, [endGame]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const doPlaceStone = useCallback((x, y, boardState, player) => {
    if (boardState[y][x] !== null) return null;
    const newBoard = boardState.map(row => [...row]);
    newBoard[y][x] = player;
    const opponent = player === 'black' ? 'white' : 'black';
    const capturedOpponent = getCapturedStones(newBoard, opponent);
    const suicide = getCapturedStones(newBoard, player);
    if (suicide.length > 0 && capturedOpponent.length === 0) return null;
    capturedOpponent.forEach(pt => { newBoard[pt.y][pt.x] = null; });
    return { newBoard, captured: capturedOpponent.length };
  }, []);

  const handleIntersectionClick = useCallback((x, y) => {
    if (isGameOverRef.current) return;
    const cp = currentPlayerRef.current;
    const result = doPlaceStone(x, y, boardRef.current, cp);
    if (!result) return;
    const { newBoard, captured } = result;
    const coord = `${LETTERS[x]}${BOARD_SIZE - y}`;
    const newMoveCount = moveCountRef.current + 1;

    setBoard(newBoard);
    setLastMove({ x, y });
    setCaptures(prev => ({ ...prev, [cp]: prev[cp] + captured }));
    setMoveHistory(prev => [...prev, { num: newMoveCount, player: cp, coord, type: 'move' }]);
    setMoveCount(newMoveCount);
    const nextPlayer = cp === 'black' ? 'white' : 'black';
    setCurrentPlayer(nextPlayer);

    if (gameModeRef.current === 'ai' && nextPlayer === 'white') {
      aiTimeout.current = setTimeout(() => {
        if (isGameOverRef.current) return;
        let placed = false;
        let attempts = 0;
        const nb = newBoard;
        while (!placed && attempts < 200) {
          const rx = Math.floor(Math.random() * BOARD_SIZE);
          const ry = Math.floor(Math.random() * BOARD_SIZE);
          if (nb[ry][rx] === null) {
            const aiResult = doPlaceStone(rx, ry, nb, 'white');
            if (aiResult) {
              const aiCoord = `${LETTERS[rx]}${BOARD_SIZE - ry}`;
              const aiMoveCount = newMoveCount + 1;
              setBoard(aiResult.newBoard);
              setLastMove({ x: rx, y: ry });
              setCaptures(prev => ({ ...prev, white: prev.white + aiResult.captured }));
              setMoveHistory(prev => [...prev, { num: aiMoveCount, player: 'white', coord: aiCoord, type: 'move' }]);
              setMoveCount(aiMoveCount);
              setCurrentPlayer('black');
              placed = true;
            }
          }
          attempts++;
        }
        if (!placed) {
          const aiMoveCount = newMoveCount + 1;
          setMoveHistory(prev => [...prev, { num: aiMoveCount, player: 'white', coord: 'Pass', type: 'pass' }]);
          setMoveCount(aiMoveCount);
          setCurrentPlayer('black');
        }
      }, 500);
    }
  }, [doPlaceStone]);

  const passTurn = () => {
    if (isGameOver) return;
    const cp = currentPlayerRef.current;
    const newMoveCount = moveCountRef.current + 1;
    setMoveHistory(prev => [...prev, { num: newMoveCount, player: cp, coord: 'Pass', type: 'pass' }]);
    setMoveCount(newMoveCount);
    setCurrentPlayer(cp === 'black' ? 'white' : 'black');
  };

  const resignGame = () => {
    if (isGameOver) return;
    endGame(currentPlayerRef.current === 'black' ? 'White' : 'Black', 'resignation');
  };

  const resetGame = () => {
    clearInterval(timerInterval.current);
    clearTimeout(aiTimeout.current);
    setBoard(initBoard());
    setCurrentPlayer('black');
    setMoveCount(0);
    setCaptures({ black: 0, white: 0 });
    setTimers({ black: 900, white: 900 });
    setIsGameOver(false);
    setLastMove(null);
    setMoveHistory([]);
    setModalVisible(false);
    setModalScale(false);
    setWinnerText('');
  };

  const handleSetMode = (mode) => {
    setGameMode(mode);
    clearInterval(timerInterval.current);
    clearTimeout(aiTimeout.current);
    setBoard(initBoard());
    setCurrentPlayer('black');
    setMoveCount(0);
    setCaptures({ black: 0, white: 0 });
    setTimers({ black: 900, white: 900 });
    setIsGameOver(false);
    setLastMove(null);
    setMoveHistory([]);
    setModalVisible(false);
    setModalScale(false);
    setWinnerText('');
  };

  return (
    <div style={{
      fontFamily: "'Fredoka', sans-serif",
      background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
      color: '#5D2E2E',
      minHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'fixed', borderRadius: '50%', zIndex: -1,
        width: '200px', height: '200px',
        background: 'linear-gradient(135deg, #FFB347, #FFCC33)',
        bottom: '50px', right: '10%',
        boxShadow: '0 20px 50px rgba(255, 179, 71, 0.4)',
        opacity: 0.8,
      }} />
      <div style={{
        position: 'fixed', borderRadius: '50%', zIndex: -1,
        width: '120px', height: '120px',
        background: 'linear-gradient(135deg, #FF9A9E, #FECFEF)',
        top: '10%', left: '5%',
        boxShadow: '0 15px 40px rgba(255, 154, 158, 0.4)',
        opacity: 0.9,
      }} />
      <div style={{
        position: 'fixed', width: '40px', height: '40px',
        background: '#FF7043', top: '20%', right: '25%',
        borderRadius: '50%', zIndex: -1, opacity: 0.6,
      }} />
      <div style={{
        position: 'fixed', width: '20px', height: '20px',
        background: '#FFD54F', bottom: '25%', left: '20%',
        borderRadius: '50%', zIndex: -1, opacity: 0.7,
      }} />

      <div style={customStyles.appContainer}>
        {/* Board Area */}
        <main style={customStyles.gameBoardArea}>
          <div style={customStyles.boardContainer}>
            {/* Coords Top */}
            <div style={customStyles.coordsTop}>
              {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                <span key={i}>{LETTERS[i]}</span>
              ))}
            </div>
            {/* Coords Left */}
            <div style={customStyles.coordsLeft}>
              {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                <span key={i}>{BOARD_SIZE - i}</span>
              ))}
            </div>
            {/* Board */}
            <div style={customStyles.goBoard}>
              <GridLayer />
              {Array.from({ length: BOARD_SIZE }).map((_, y) =>
                Array.from({ length: BOARD_SIZE }).map((_, x) => (
                  <Intersection
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    stone={board[y][x]}
                    isLast={lastMove !== null && lastMove.x === x && lastMove.y === y}
                    onClick={handleIntersectionClick}
                  />
                ))
              )}
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside style={customStyles.gameSidebar}>
          {/* Mode Switch */}
          <div style={customStyles.modeSwitch}>
            {['local', 'ai'].map(mode => (
              <button
                key={mode}
                style={{
                  ...customStyles.modeOptionBase,
                  ...(gameMode === mode ? customStyles.modeOptionActive : {}),
                }}
                onClick={() => handleSetMode(mode)}
              >
                {mode === 'local' ? 'Local' : 'Versus AI'}
              </button>
            ))}
          </div>

          {/* Player 1 Card */}
          <div style={{
            ...customStyles.playerCard,
            ...(currentPlayer === 'black' && !isGameOver ? customStyles.playerCardActive : {}),
          }}>
            <div style={customStyles.playerHeader}>
              <div style={{ ...customStyles.avatarBase, ...customStyles.avatarP1 }}>
                <PersonIcon />
              </div>
              <div style={customStyles.playerInfo}>
                <h2 style={customStyles.playerInfoH2}>You</h2>
                <div style={customStyles.playerStatus}>
                  <div style={{ ...customStyles.statusBadgeBase, ...customStyles.statusBadgeDark }}>
                    <StoneIcon color="white" />
                    <span>{captures.black}</span>
                  </div>
                  <div style={customStyles.statusBadgeBase}>Black</div>
                </div>
              </div>
              <div style={customStyles.timer}>{formatTime(timers.black)}</div>
            </div>
          </div>

          {/* Player 2 Card */}
          <div style={{
            ...customStyles.playerCard,
            ...(currentPlayer === 'white' && !isGameOver ? customStyles.playerCardActive : {}),
          }}>
            <div style={customStyles.playerHeader}>
              <div style={{
                ...customStyles.avatarBase,
                ...(gameMode === 'ai' ? customStyles.avatarAI : customStyles.avatarP2),
              }}>
                {gameMode === 'ai' ? <MonitorIcon /> : <GroupIcon />}
              </div>
              <div style={customStyles.playerInfo}>
                <h2 style={customStyles.playerInfoH2}>{gameMode === 'ai' ? 'AlphaGo' : 'Player 2'}</h2>
                <div style={customStyles.playerStatus}>
                  <div style={{ ...customStyles.statusBadgeBase, ...customStyles.statusBadgeDark }}>
                    <StoneIcon color="black" />
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
              <span style={customStyles.moveCountBadge}>Moves: {moveCount}</span>
            </div>
            <div
              ref={moveListRef}
              className="move-list-scroll"
              style={customStyles.moveList}
            >
              {moveHistory.length === 0 && (
                <div style={{ ...customStyles.moveItem, justifyContent: 'center', opacity: 0.6, fontWeight: 500, fontStyle: 'italic' }}>
                  Game started
                </div>
              )}
              {moveHistory.map((item, idx) => (
                <div key={idx} className="move-item-hover" style={customStyles.moveItem}>
                  <span style={customStyles.moveNum}>{item.num}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StoneIcon color={item.player} />
                    <span style={{ fontFamily: "'Fredoka', sans-serif" }}>{item.player === 'black' ? 'Black' : 'White'}</span>
                  </div>
                  <span style={{
                    ...customStyles.moveCoord,
                    ...(item.type === 'pass' ? { color: '#CC9999' } : {}),
                  }}>{item.coord}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div style={customStyles.controls}>
            <button
              className="btn-active"
              style={{ ...customStyles.btnBase, ...customStyles.btnSecondary }}
              onClick={passTurn}
            >
              Pass
            </button>
            <button
              className="btn-active"
              style={{ ...customStyles.btnBase, ...customStyles.btnDanger }}
              onClick={resignGame}
            >
              Resign
            </button>
          </div>
        </aside>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div style={{
          ...customStyles.modalOverlayBase,
          opacity: modalScale ? 1 : 0,
          pointerEvents: modalScale ? 'all' : 'none',
        }}>
          <div style={{
            ...customStyles.modalCard,
            transform: modalScale ? 'scale(1)' : 'scale(0.9)',
          }}>
            <h2 style={{ fontSize: '32px', marginBottom: '12px', color: '#5D2E2E', fontFamily: "'Fredoka', sans-serif" }}>
              Game Over!
            </h2>
            <p style={{ color: '#9C5555', marginBottom: '28px', lineHeight: 1.5, fontSize: '18px', fontFamily: "'Fredoka', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: winnerText }}
            />
            <button
              className="btn-active"
              style={{ ...customStyles.btnBase, ...customStyles.btnDanger, flex: 'none', width: '100%' }}
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