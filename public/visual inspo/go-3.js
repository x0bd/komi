import React, { useState, useEffect, useRef, useCallback } from 'react';

const BOARD_SIZE = 19;
const LETTERS = "ABCDEFGHJKLMNOPQRST";

const tips = {
  opening: "Start near the corners! Corner territory is easiest to secure with just a few stones. 🏯",
  capture: "Surround a stone on all 4 sides (up, down, left, right) to capture it. Captured stones are your prisoners! ⚔️",
  territory: "At the end of the game, count your enclosed empty intersections. More territory = more points! 🗺️",
  ai_move: "Hmm, my AI made a random move this time — a real AI would look for weak groups to attack! 🤔",
  pass: "Both players pass in a row = game ends! Only pass when the board is settled. ✋",
  capture_achieved: "Nice capture! You removed some stones — they count as points at the end! 🎊"
};

const customStyles = {
  body: {
    fontFamily: "'Fredoka', 'Nunito', sans-serif",
    backgroundColor: '#FFFBEA',
    color: '#5D4037',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: `linear-gradient(45deg, #FFF8E1 25%, transparent 25%, transparent 75%, #FFF8E1 75%, #FFF8E1), linear-gradient(45deg, #FFF8E1 25%, transparent 25%, transparent 75%, #FFF8E1 75%, #FFF8E1)`,
    backgroundSize: '60px 60px',
    backgroundPosition: '0 0, 30px 30px',
  },
  boardContainer: {
    background: '#E8A87C',
    borderRadius: '45px',
    padding: '30px',
    boxShadow: '8px 8px 0px rgba(93,64,55,0.15), inset 4px 4px 0px rgba(255,255,255,0.2), inset -4px -4px 0px rgba(0,0,0,0.1)',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '3px solid #5D4037',
  },
  boardInner: {
    position: 'absolute',
    width: 'calc(100% - 40px)',
    height: 'calc(100% - 40px)',
    background: '#FFF3C4',
    borderRadius: '35px',
    border: '2px solid rgba(0,0,0,0.05)',
    zIndex: 0,
  },
  goBoard: {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
    gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
    gap: 0,
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
    zIndex: 2,
    boxShadow: '1px 2px 0px rgba(62,39,35,0.3)',
    background: '#3E2723',
    border: '2px solid #3E2723',
    position: 'relative',
    animation: 'placeStone 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
  },
  stoneWhite: {
    width: '92%',
    height: '92%',
    borderRadius: '50%',
    zIndex: 2,
    boxShadow: '1px 2px 0px rgba(62,39,35,0.3)',
    background: '#FAFAFA',
    border: '2px solid #E0E0E0',
    position: 'relative',
    animation: 'placeStone 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
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
    top: '-35px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '0 16px',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#5D4037',
    pointerEvents: 'none',
    zIndex: 2,
  },
  coordsLeft: {
    position: 'absolute',
    left: '-35px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '16px 0',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#5D4037',
    pointerEvents: 'none',
    zIndex: 2,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255,251,234,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    transition: 'opacity 0.3s',
  },
  modalCard: {
    background: '#FFFFFF',
    padding: '40px',
    borderRadius: '40px',
    border: '3px solid #5D4037',
    boxShadow: '10px 10px 0px rgba(93,64,55,0.15)',
    textAlign: 'center',
    maxWidth: '400px',
    transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
  },
};

function createEmptyBoard() {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function checkGroupLiberties(board, x, y, color) {
  const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
  const group = [];
  visited[y][x] = true;
  group.push({ x, y });
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let hasLiberties = false;
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
  return { hasLiberties, group };
}

function getCapturedStones(board, color) {
  const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
  let captured = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === color && !visited[y][x]) {
        const { hasLiberties, group } = checkGroupLiberties(board, x, y, color);
        group.forEach(pt => { visited[pt.y][pt.x] = true; });
        if (!hasLiberties) {
          captured = captured.concat(group);
        }
      }
    }
  }
  return captured;
}

const GoBoard = ({ board, lastMove, onIntersectionClick }) => {
  const hoshiPoints = [
    [3,3],[3,9],[3,15],[9,3],[9,9],[9,15],[15,3],[15,9],[15,15]
  ];

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
        <div style={customStyles.gridLayer}>
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={`v${i}`} style={{
              background: '#5D4037',
              position: 'absolute',
              left: `${(i / (BOARD_SIZE - 1)) * 100}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              opacity: 0.6,
            }} />
          ))}
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={`h${i}`} style={{
              background: '#5D4037',
              position: 'absolute',
              top: `${(i / (BOARD_SIZE - 1)) * 100}%`,
              left: 0,
              right: 0,
              height: '2px',
              opacity: 0.6,
            }} />
          ))}
          {hoshiPoints.map(([px, py], idx) => (
            <div key={`hoshi${idx}`} style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: '#5D4037',
              borderRadius: '50%',
              left: `${(px / (BOARD_SIZE - 1)) * 100}%`,
              top: `${(py / (BOARD_SIZE - 1)) * 100}%`,
              transform: 'translate(-50%, -50%)',
              opacity: 0.8,
            }} />
          ))}
        </div>
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => {
            const stone = board[y][x];
            const isLastMove = lastMove && lastMove.x === x && lastMove.y === y;
            return (
              <div
                key={`${x}-${y}`}
                style={customStyles.intersection}
                onClick={() => onIntersectionClick(x, y)}
              >
                {stone && (
                  <div style={stone === 'black' ? customStyles.stoneBlack : customStyles.stoneWhite}>
                    <div style={{
                      position: 'absolute',
                      top: '15%',
                      left: '15%',
                      width: '25%',
                      height: '25%',
                      borderRadius: '50%',
                      background: stone === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                    }} />
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

const AIChatPanel = ({ messages, onShowTip }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      border: '3px solid #5D4037',
      boxShadow: '4px 4px 0px #5D4037',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        background: '#4FC3A1',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '3px solid #5D4037',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          background: '#fff',
          borderRadius: '50%',
          border: '2px solid #5D4037',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
        }}>🤖</div>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', flex: 1 }}>Sensei Bot</span>
        <div style={{
          width: '8px',
          height: '8px',
          background: '#A8EED4',
          borderRadius: '50%',
          boxShadow: '0 0 6px #A8EED4',
        }} />
      </div>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '80px', maxHeight: '120px', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            background: msg.isTip ? '#FFFBEA' : '#E8F8F2',
            borderRadius: '16px 16px 16px 4px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#5D4037',
            lineHeight: 1.5,
            border: msg.isTip ? '2px solid #FFE082' : '2px solid #C8EEE0',
            maxWidth: '90%',
          }}>{msg.text}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: '6px', padding: '0 12px 12px', flexWrap: 'wrap' }}>
        {[['opening', 'Opening tips'], ['capture', 'How to capture'], ['territory', 'Territory']].map(([key, label]) => (
          <div key={key} onClick={() => onShowTip(key)} style={{
            background: '#FFF3E0',
            border: '2px solid #5D4037',
            borderRadius: '99px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#5D4037',
            cursor: 'pointer',
          }}>{label}</div>
        ))}
      </div>
    </div>
  );
};

const XPBar = ({ streak, fillPercent }) => (
  <div style={{
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '3px solid #5D4037',
    boxShadow: '4px 4px 0 #5D4037',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }}>
    <div style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>🔥</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#8D6E63', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Today's Streak</div>
      <div style={{ background: '#FFF3E0', borderRadius: '99px', height: '10px', overflow: 'hidden', border: '2px solid #5D4037' }}>
        <div style={{
          height: '100%',
          borderRadius: '99px',
          background: 'linear-gradient(90deg, #9CCC65, #FDD835)',
          width: `${fillPercent}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
    <div style={{ fontSize: '16px', fontWeight: 800, color: '#D87A56', flexShrink: 0 }}>{streak}</div>
  </div>
);

const PlayerCard = ({ name, avatarClass, stoneColor, captureStoneColor, captures, timer, isActive, avatarContent }) => {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '32px',
    padding: '20px',
    border: isActive ? '3px solid #5D4037' : '3px solid #5D4037',
    boxShadow: isActive ? '6px 6px 0px #5D4037' : '4px 4px 0px rgba(93,64,55,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
    transform: isActive ? 'translateY(-4px)' : 'none',
  };

  const avatarBg = avatarClass === 'p1' ? '#9CCC65' : avatarClass === 'p2' ? '#D87A56' : '#8D6E63';

  return (
    <div style={cardStyle}>
      {isActive && (
        <div style={{
          position: 'absolute',
          top: '-15px',
          right: '20px',
          width: '30px',
          height: '30px',
          background: '#D87A56',
          borderRadius: '50%',
          border: '3px solid #5D4037',
          zIndex: 10,
          backgroundImage: 'radial-gradient(circle, #fff 20%, transparent 20%)',
          backgroundSize: '5px 5px',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          border: '3px solid #5D4037',
          background: avatarBg,
          color: '#FFFFFF',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {avatarContent}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#5D4037' }}>{name}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              background: '#5D4037',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              gap: '6px',
              border: isActive ? '2px solid #8D6E63' : '2px solid transparent',
            }}>
              <span style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                display: 'inline-block',
                border: '1px solid rgba(0,0,0,0.1)',
                background: captureStoneColor === 'white' ? '#FAFAFA' : '#3E2723',
                flexShrink: 0,
              }} />
              <span>{captures}</span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              background: '#FFF3E0',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#8D6E63',
              border: isActive ? '2px solid #8D6E63' : '2px solid transparent',
            }}>
              {stoneColor}
            </div>
          </div>
        </div>
        <div style={{
          fontVariantNumeric: 'tabular-nums',
          fontFamily: "'Nunito', sans-serif",
          fontSize: '26px',
          fontWeight: 800,
          color: '#5D4037',
          marginLeft: 'auto',
          background: '#FFF3E0',
          padding: '4px 12px',
          borderRadius: '12px',
          flexShrink: 0,
        }}>{timer}</div>
      </div>
    </div>
  );
};

const App = () => {
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [moveCount, setMoveCount] = useState(0);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [gameMode, setGameModeState] = useState('local');
  const [isGameOver, setIsGameOver] = useState(false);
  const [timers, setTimers] = useState({ black: 900, white: 900 });
  const [lastMove, setLastMove] = useState(null);
  const [moveHistory, setMoveHistory] = useState([{ type: 'start' }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [winnerText, setWinnerText] = useState('');
  const [aiMessages, setAIMessages] = useState([{ text: 'Welcome! Place your stones on the intersections. Surround territory to win! 🎉', isTip: false }]);
  const [xpStreak, setXpStreak] = useState(3);
  const [xpFill, setXpFill] = useState(62);
  const [activeMode, setActiveMode] = useState('local');
  const [p2Name, setP2Name] = useState('Player 2');
  const [p2AvatarClass, setP2AvatarClass] = useState('p2');

  const currentPlayerRef = useRef(currentPlayer);
  const boardRef = useRef(board);
  const isGameOverRef = useRef(isGameOver);
  const timerInterval = useRef(null);
  const gameModeRef = useRef(gameMode);

  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

  const addAIMessage = useCallback((text, isTip = false) => {
    setAIMessages(prev => {
      const next = [...prev, { text, isTip }];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startTimer = useCallback(() => {
    clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      if (isGameOverRef.current) return;
      const cp = currentPlayerRef.current;
      setTimers(prev => {
        const next = { ...prev, [cp]: prev[cp] - 1 };
        if (next[cp] <= 0) {
          clearInterval(timerInterval.current);
          const winner = cp === 'black' ? 'White' : 'Black';
          setWinnerText(`<strong>${winner}</strong> wins by timeout.`);
          setModalVisible(true);
          setIsGameOver(true);
        }
        return next;
      });
    }, 1000);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setMoveCount(0);
    setCaptures({ black: 0, white: 0 });
    setTimers({ black: 900, white: 900 });
    setIsGameOver(false);
    setLastMove(null);
    setMoveHistory([{ type: 'start' }]);
    setModalVisible(false);
    setWinnerText('');
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerInterval.current);
  }, [currentPlayer, startTimer]);

  const handleIntersectionClick = useCallback((x, y) => {
    if (isGameOverRef.current) return;
    const currentBoard = boardRef.current;
    if (currentBoard[y][x] !== null) return;

    const cp = currentPlayerRef.current;
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[y][x] = cp;

    const opponent = cp === 'black' ? 'white' : 'black';
    const capturedOpponent = getCapturedStones(newBoard, opponent);

    if (capturedOpponent.length === 0) {
      const suicideStones = getCapturedStones(newBoard, cp);
      if (suicideStones.length > 0) return;
    }

    capturedOpponent.forEach(pt => { newBoard[pt.y][pt.x] = null; });

    setBoard(newBoard);
    setLastMove({ x, y });

    if (capturedOpponent.length > 0) {
      setCaptures(prev => ({ ...prev, [cp]: prev[cp] + capturedOpponent.length }));
      setXpStreak(prev => prev + 1);
      setXpFill(prev => Math.min(100, prev + 7));
      addAIMessage(tips['capture_achieved'], false);
    }

    const coord = `${LETTERS[x]}${BOARD_SIZE - y}`;
    setMoveHistory(prev => [...prev, { type: 'move', player: cp, coord, num: prev.length }]);
    setMoveCount(prev => prev + 1);
    setCurrentPlayer(prev => prev === 'black' ? 'white' : 'black');
  }, [addAIMessage]);

  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'white' && !isGameOver) {
      const timeout = setTimeout(() => {
        const currentBoard = boardRef.current;
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 200) {
          const rx = Math.floor(Math.random() * BOARD_SIZE);
          const ry = Math.floor(Math.random() * BOARD_SIZE);
          if (currentBoard[ry][rx] === null) {
            handleIntersectionClick(rx, ry);
            placed = true;
          }
          attempts++;
        }
        if (!placed) {
          setMoveHistory(prev => [...prev, { type: 'pass', player: 'white', num: prev.length }]);
          setMoveCount(prev => prev + 1);
          setCurrentPlayer('black');
          addAIMessage(tips['pass'], false);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, gameMode, isGameOver, handleIntersectionClick, addAIMessage]);

  const passTurn = () => {
    const cp = currentPlayer;
    setMoveHistory(prev => [...prev, { type: 'pass', player: cp, num: prev.length }]);
    setMoveCount(prev => prev + 1);
    setCurrentPlayer(prev => prev === 'black' ? 'white' : 'black');
    addAIMessage(tips['pass'], false);
  };

  const resignGame = () => {
    const winner = currentPlayer === 'black' ? 'White' : 'Black';
    setWinnerText(`<strong>${winner}</strong> wins by resignation.`);
    setModalVisible(true);
    setIsGameOver(true);
    clearInterval(timerInterval.current);
  };

  const setMode = (mode) => {
    setActiveMode(mode);
    setGameModeState(mode);
    gameModeRef.current = mode;
    if (mode === 'ai') {
      setP2Name('AlphaGo');
      setP2AvatarClass('ai');
    } else {
      setP2Name('Player 2');
      setP2AvatarClass('p2');
    }
    resetGame();
  };

  const showTip = (key) => {
    addAIMessage(tips[key] || 'Keep playing and you will get better!', true);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@700;800&display=swap');
      @keyframes placeStone {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { overflow: hidden; }
      .move-list-scroll::-webkit-scrollbar { width: 8px; }
      .move-list-scroll::-webkit-scrollbar-thumb { background-color: #BCAAA4; border-radius: 10px; border: 2px solid #FFFFFF; }
      .tip-chip-hover:hover { background: #FDD835 !important; transform: scale(1.05); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const p1Avatar = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>
  );

  const p2AvatarLocal = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const p2AvatarAI = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );

  return (
    <div style={customStyles.body}>
      <div style={{
        position: 'fixed',
        width: '200px',
        height: '200px',
        background: '#FDD835',
        borderRadius: '50%',
        bottom: '40px',
        right: '40px',
        border: '4px solid #5D4037',
        opacity: 0.2,
        zIndex: -1,
      }} />
      <div style={{
        position: 'fixed',
        width: '300px',
        height: '300px',
        background: '#9CCC65',
        borderRadius: '50%',
        top: '-60px',
        left: '-60px',
        border: '4px solid #5D4037',
        opacity: 0.15,
        zIndex: -1,
      }} />

      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1400px',
        height: '90vh',
        gap: '40px',
        padding: '0 40px',
      }}>
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          <div style={customStyles.boardContainer}>
            <div style={customStyles.boardInner} />
            <GoBoard
              board={board}
              lastMove={lastMove}
              onIntersectionClick={handleIntersectionClick}
            />
          </div>
        </main>

        <aside style={{
          width: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: '320px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}>
          <div style={{
            background: '#FFFFFF',
            padding: '8px',
            borderRadius: '999px',
            display: 'flex',
            border: '3px solid #5D4037',
            boxShadow: '4px 4px 0px rgba(93,64,55,0.15)',
          }}>
            {['local', 'ai'].map(mode => (
              <div key={mode} onClick={() => setMode(mode)} style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px 0',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: activeMode === mode ? '#5D4037' : '#8D6E63',
                background: activeMode === mode ? '#FDD835' : 'transparent',
                border: activeMode === mode ? '2px solid #5D4037' : '2px solid transparent',
                boxShadow: activeMode === mode ? '2px 2px 0px rgba(93,64,55,0.2)' : 'none',
              }}>
                {mode === 'local' ? 'Local' : 'Versus AI'}
              </div>
            ))}
          </div>

          <PlayerCard
            name="You"
            avatarClass="p1"
            stoneColor="Black"
            captureStoneColor="white"
            captures={captures.black}
            timer={formatTimer(timers.black)}
            isActive={currentPlayer === 'black'}
            avatarContent={p1Avatar}
          />

          <PlayerCard
            name={p2Name}
            avatarClass={p2AvatarClass}
            stoneColor="White"
            captureStoneColor="black"
            captures={captures.white}
            timer={formatTimer(timers.white)}
            isActive={currentPlayer === 'white'}
            avatarContent={p2AvatarClass === 'ai' ? p2AvatarAI : p2AvatarLocal}
          />

          <div style={{
            background: '#FFFFFF',
            borderRadius: '32px',
            flex: 1,
            padding: '24px',
            border: '3px solid #5D4037',
            boxShadow: '4px 4px 0px rgba(93,64,55,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: '160px',
            maxHeight: '220px',
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#5D4037',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>History</span>
              <span style={{
                fontSize: '14px',
                color: '#8D6E63',
                background: '#FFF3E0',
                padding: '6px 10px',
                borderRadius: '99px',
                fontWeight: 700,
              }}>Moves: {moveCount}</span>
            </div>
            <div className="move-list-scroll" style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '4px',
            }}>
              {moveHistory.map((item, idx) => (
                item.type === 'start' ? (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#FFFBEA',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#8D6E63',
                    border: '1px solid rgba(93,64,55,0.1)',
                    justifyContent: 'center',
                    opacity: 0.7,
                  }}>Game started</div>
                ) : (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#FFFBEA',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#8D6E63',
                    border: '1px solid rgba(93,64,55,0.1)',
                  }}>
                    <span style={{ width: '28px', color: '#5D4037', fontSize: '14px', fontWeight: 700 }}>{item.num}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        display: 'inline-block',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: item.player === 'black' ? '#3E2723' : '#FAFAFA',
                        flexShrink: 0,
                      }} />
                      <span>{item.player === 'black' ? 'Black' : 'White'}</span>
                    </div>
                    <span style={{
                      color: item.type === 'pass' ? '#BCAAA4' : '#5D4037',
                      fontWeight: 700,
                      marginLeft: 'auto',
                      fontFamily: "'Nunito', monospace",
                    }}>{item.type === 'pass' ? 'Pass' : item.coord}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          <XPBar streak={xpStreak} fillPercent={xpFill} />
          <AIChatPanel messages={aiMessages} onShowTip={showTip} />

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={passTurn} style={{
              flex: 1,
              padding: '16px',
              borderRadius: '20px',
              border: '3px solid #5D4037',
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              background: '#FFFFFF',
              color: '#5D4037',
              boxShadow: '0px 4px 0px #5D4037',
              position: 'relative',
              top: 0,
              transition: 'transform 0.1s, box-shadow 0.2s',
            }}>Pass</button>
            <button onClick={resignGame} style={{
              flex: 1,
              padding: '16px',
              borderRadius: '20px',
              border: '3px solid #5D4037',
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              background: '#D87A56',
              color: 'white',
              boxShadow: '0px 4px 0px #5D4037',
              position: 'relative',
              top: 0,
              transition: 'transform 0.1s, box-shadow 0.2s',
            }}>Resign</button>
          </div>
        </aside>
      </div>

      {modalVisible && (
        <div style={{ ...customStyles.modalOverlay, opacity: 1 }}>
          <div style={{ ...customStyles.modalCard, transform: 'translateY(0)' }}>
            <h2 style={{
              fontSize: '32px',
              marginBottom: '12px',
              color: '#5D4037',
              fontFamily: "'Fredoka', sans-serif",
            }}>Game Over!</h2>
            <p style={{
              color: '#8D6E63',
              marginBottom: '32px',
              lineHeight: 1.5,
              fontSize: '18px',
            }} dangerouslySetInnerHTML={{ __html: winnerText }} />
            <button onClick={resetGame} style={{
              width: '100%',
              padding: '16px',
              borderRadius: '20px',
              border: '3px solid #5D4037',
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              background: '#FDD835',
              color: '#5D4037',
              boxShadow: '0px 4px 0px #5D4037',
            }}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;