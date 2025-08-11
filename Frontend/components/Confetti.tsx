import React, { useState, useEffect } from 'react';

const ConfettiPiece: React.FC<{ id: number }> = ({ id }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const colors = ['#fde047', '#f97316', '#ec4899', '#8b5cf6', '#3b82f6'];
    setStyle({
      left: `${Math.random() * 100}%`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: `${Math.random() * 1.5}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    });
  }, [id]);

  return <div className="absolute w-3 h-3 rounded-full opacity-0 animate-fall" style={style}></div>;
};

const Confetti: React.FC = () => {
  const particles = Array.from({ length: 100 }, (_, i) => i);
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-50">
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; }
          }
          .animate-fall {
            animation-name: fall;
            animation-timing-function: linear;
            animation-iteration-count: 1;
          }
        `}
      </style>
      {particles.map(id => <ConfettiPiece key={id} id={id} />)}
    </div>
  );
};

export default Confetti;