import React from 'react';

interface VirtualKeyboardProps {
  targetKey: string; // The character that the user is supposed to type next
  pressedKey: string | null; // The character the user is currently pressing
}

interface KeyConfig {
  key: string;
  display: string;
  finger: string;
  hand: 'left' | 'right' | 'thumb';
  color: string;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ targetKey, pressedKey }) => {
  
  // Define keyboard rows with finger color associations
  const row1: KeyConfig[] = [
    { key: '`', display: '`', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: '1', display: '1', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: '2', display: '2', finger: 'left-ring', hand: 'left', color: '#ff814a' },
    { key: '3', display: '3', finger: 'left-middle', hand: 'left', color: '#ffd04a' },
    { key: '4', display: '4', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: '5', display: '5', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: '6', display: '6', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: '7', display: '7', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: '8', display: '8', finger: 'right-middle', hand: 'right', color: '#4a9cff' },
    { key: '9', display: '9', finger: 'right-ring', hand: 'right', color: '#aa4aff' },
    { key: '0', display: '0', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: '-', display: '-', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: '=', display: '=', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: 'BACKSPACE', display: '⌫', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
  ];

  const row2: KeyConfig[] = [
    { key: 'TAB', display: 'Tab', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: 'Q', display: 'Q', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: 'W', display: 'W', finger: 'left-ring', hand: 'left', color: '#ff814a' },
    { key: 'E', display: 'E', finger: 'left-middle', hand: 'left', color: '#ffd04a' },
    { key: 'R', display: 'R', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: 'T', display: 'T', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: 'Y', display: 'Y', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: 'U', display: 'U', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: 'I', display: 'I', finger: 'right-middle', hand: 'right', color: '#4a9cff' },
    { key: 'O', display: 'O', finger: 'right-ring', hand: 'right', color: '#aa4aff' },
    { key: 'P', display: 'P', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: '[', display: '[', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: ']', display: ']', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: '\\', display: '\\', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
  ];

  const row3: KeyConfig[] = [
    { key: 'CAPS', display: 'Caps', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: 'A', display: 'A', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: 'S', display: 'S', finger: 'left-ring', hand: 'left', color: '#ff814a' },
    { key: 'D', display: 'D', finger: 'left-middle', hand: 'left', color: '#ffd04a' },
    { key: 'F', display: 'F', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: 'G', display: 'G', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: 'H', display: 'H', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: 'J', display: 'J', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: 'K', display: 'K', finger: 'right-middle', hand: 'right', color: '#4a9cff' },
    { key: 'L', display: 'L', finger: 'right-ring', hand: 'right', color: '#aa4aff' },
    { key: ';', display: ';', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: "'", display: "'", finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: 'ENTER', display: '⏎ Enter', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
  ];

  const row4: KeyConfig[] = [
    { key: 'SHIFT', display: 'Shift', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: 'Z', display: 'Z', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: 'X', display: 'X', finger: 'left-ring', hand: 'left', color: '#ff814a' },
    { key: 'C', display: 'C', finger: 'left-middle', hand: 'left', color: '#ffd04a' },
    { key: 'V', display: 'V', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: 'B', display: 'B', finger: 'left-index', hand: 'left', color: '#4aff77' },
    { key: 'N', display: 'N', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: 'M', display: 'M', finger: 'right-index', hand: 'right', color: '#4afff9' },
    { key: ',', display: ',', finger: 'right-middle', hand: 'right', color: '#4a9cff' },
    { key: '.', display: '.', finger: 'right-ring', hand: 'right', color: '#aa4aff' },
    { key: '/', display: '/', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
    { key: 'SHIFT', display: 'Shift', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' },
  ];

  const row5: KeyConfig[] = [
    { key: 'CTRL', display: 'Ctrl', finger: 'left-pinky', hand: 'left', color: '#ff4a7d' },
    { key: 'ALT', display: 'Alt', finger: 'thumb', hand: 'thumb', color: '#e2e8f0' },
    { key: 'SPACE', display: 'Space', finger: 'thumb', hand: 'thumb', color: '#a855f7' },
    { key: 'ALT', display: 'Alt', finger: 'thumb', hand: 'thumb', color: '#e2e8f0' },
    { key: 'CTRL', display: 'Ctrl', finger: 'right-pinky', hand: 'right', color: '#ff4ad0' }
  ];

  // Map input character to the QWERTY key representation
  const mapCharToKey = (char: string): string => {
    if (!char) return "";
    if (char === " ") return "SPACE";
    if (char === "\n") return "ENTER";
    const upper = char.toUpperCase();
    
    const shiftSymbols: { [key: string]: string } = {
      '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
      '_': '-', '+': '=', '{': '[', '}': ']', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
    };
    if (shiftSymbols[char]) return shiftSymbols[char];
    return upper;
  };

  const targetKeyId = mapCharToKey(targetKey);
  const pressedKeyId = pressedKey ? mapCharToKey(pressedKey) : "";

  // Identify active target finger characteristics
  const getTargetKeyFinger = (): KeyConfig | null => {
    const allKeys = [...row1, ...row2, ...row3, ...row4, ...row5];
    return allKeys.find(k => k.key === targetKeyId) || null;
  };

  const currentFingerGuide = getTargetKeyFinger();

  const renderKey = (config: KeyConfig, index: number, customWidth?: string) => {
    const isTarget = config.key === targetKeyId;
    const isPressed = config.key === pressedKeyId;
    
    return (
      <div
        key={`${config.key}-${index}`}
        className={`keyboard-key ${isPressed ? 'active' : ''} ${isTarget ? 'highlight-target' : ''}`}
        style={{
          height: '40px',
          width: customWidth || '40px',
          fontSize: '12px',
          borderRadius: '6px',
          border: isTarget ? `2px solid ${config.color}` : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isTarget ? `0 0 8px ${config.color}44` : 'none',
          backgroundColor: isPressed ? 'var(--primary)' : isTarget ? `${config.color}15` : 'rgba(255,255,255,0.02)',
          color: isPressed ? 'var(--text-dark)' : isTarget ? config.color : 'var(--text-muted)'
        }}
      >
        {config.display}
      </div>
    );
  };

  // Helper to determine if a finger on a hand is currently highlighted
  const isFingerActive = (handSide: 'left' | 'right', fingerName: string): boolean => {
    if (!currentFingerGuide) return false;
    
    // Check spacebar thumbs
    if (currentFingerGuide.finger === 'thumb') {
      return fingerName === 'thumb'; // highlight thumbs on both hands or default space
    }
    
    return currentFingerGuide.finger === `${handSide}-${fingerName}`;
  };

  // Inline SVG visual hand overlay component
  const renderHandOverlay = () => {
    const activeColor = currentFingerGuide ? currentFingerGuide.color : 'var(--accent)';

    // Individual Hand SVG rendering
    const drawHand = (side: 'left' | 'right') => {
      const isL = side === 'left';
      
      // Coordinate parameters
      const fingers = [
        { name: 'pinky', cx: isL ? 30 : 170, cy: 60, r: 8 },
        { name: 'ring', cx: isL ? 60 : 140, cy: 40, r: 9 },
        { name: 'middle', cx: isL ? 90 : 110, cy: 30, r: 9.5 },
        { name: 'index', cx: isL ? 120 : 80, cy: 45, r: 9 },
        { name: 'thumb', cx: isL ? 165 : 35, cy: 110, r: 9 }
      ];

      return (
        <svg width="200" height="180" viewBox="0 0 200 180" style={{ opacity: 0.85 }}>
          {/* Hand Palm outline */}
          <path
            d={isL 
              ? "M 40 120 Q 25 150 50 170 Q 100 180 150 170 Q 170 140 140 110 Q 130 90 120 100 Q 100 90 90 90 Q 70 90 60 100 Z" 
              : "M 160 120 Q 175 150 150 170 Q 100 180 50 170 Q 30 140 60 110 Q 70 90 80 100 Q 100 90 110 90 Q 130 90 140 100 Z"
            }
            fill="rgba(255, 255, 255, 0.02)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="2"
          />

          {/* Finger nodes */}
          {fingers.map((f) => {
            const active = isFingerActive(side, f.name);
            return (
              <g key={f.name}>
                {/* Finger connector bone lines */}
                <line
                  x1={f.cx}
                  y1={f.cy}
                  x2={isL ? (f.name === 'thumb' ? 140 : f.cx - 5) : (f.name === 'thumb' ? 60 : f.cx + 5)}
                  y2={f.name === 'thumb' ? 135 : 115}
                  stroke={active ? activeColor : "rgba(255,255,255,0.06)"}
                  strokeWidth={active ? "3" : "1.5"}
                />
                
                {/* Visual Finger cap circle */}
                <circle
                  cx={f.cx}
                  cy={f.cy}
                  r={f.r}
                  fill={active ? activeColor : "rgba(255,255,255,0.04)"}
                  stroke={active ? "#fff" : "rgba(255,255,255,0.15)"}
                  strokeWidth="2"
                  style={{
                    filter: active ? `drop-shadow(0 0 6px ${activeColor})` : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
                {/* Short labels */}
                {active && (
                  <text
                    x={f.cx}
                    y={f.cy - 14}
                    fill={activeColor}
                    fontSize="9"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      );
    };

    return (
      <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '5px' }}>LEFT HAND</span>
          {drawHand('left')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '5px' }}>RIGHT HAND</span>
          {drawHand('right')}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '750px', margin: '0 auto' }}>
      
      {/* Keyboard Grid */}
      <div className="card-glass" style={{
        padding: '12px',
        background: 'rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          {row1.map((k, i) => renderKey(k, i, k.key === 'BACKSPACE' ? '65px' : undefined))}
        </div>
        {/* Row 2 */}
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          {row2.map((k, i) => renderKey(k, i, k.key === 'TAB' || k.key === '\\' ? '55px' : undefined))}
        </div>
        {/* Row 3 */}
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          {row3.map((k, i) => renderKey(k, i, k.key === 'CAPS' ? '65px' : k.key === 'ENTER' ? '75px' : undefined))}
        </div>
        {/* Row 4 */}
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          {row4.map((k, i) => renderKey(k, i, k.key === 'SHIFT' ? '85px' : undefined))}
        </div>
        {/* Row 5 */}
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          {renderKey(row5[0], 0, '55px')}
          {renderKey(row5[1], 1, '45px')}
          {renderKey(row5[2], 2, '230px')} {/* Space */}
          {renderKey(row5[3], 3, '45px')}
          {renderKey(row5[4], 4, '55px')}
        </div>
      </div>

      {/* Hand diagrams overlay */}
      {renderHandOverlay()}
      
    </div>
  );
};
