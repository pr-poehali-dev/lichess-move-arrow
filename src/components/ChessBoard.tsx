import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Arrow {
  from: string;
  to: string;
  color: string;
}

interface ChessBoardProps {
  arrows: Arrow[];
  onArrowAdd: (arrow: Arrow) => void;
  currentColor: string;
}

const ChessBoard = ({ arrows, onArrowAdd, currentColor }: ChessBoardProps) => {
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getSquareCoordinates = (square: string) => {
    const file = square[0];
    const rank = square[1];
    const col = files.indexOf(file);
    const row = ranks.indexOf(rank);
    const squareSize = boardRef.current ? boardRef.current.offsetWidth / 8 : 60;
    return {
      x: (col + 0.5) * squareSize,
      y: (row + 0.5) * squareSize,
    };
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, from: string, to: string, color: string) => {
    const fromCoords = getSquareCoordinates(from);
    const toCoords = getSquareCoordinates(to);

    const headlen = 15;
    const dx = toCoords.x - fromCoords.x;
    const dy = toCoords.y - fromCoords.y;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromCoords.x, fromCoords.y);
    ctx.lineTo(toCoords.x, toCoords.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toCoords.x, toCoords.y);
    ctx.lineTo(
      toCoords.x - headlen * Math.cos(angle - Math.PI / 6),
      toCoords.y - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toCoords.x - headlen * Math.cos(angle + Math.PI / 6),
      toCoords.y - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  const redrawArrows = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !boardRef.current) return;

    canvas.width = boardRef.current.offsetWidth;
    canvas.height = boardRef.current.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    arrows.forEach((arrow) => {
      drawArrow(ctx, arrow.from, arrow.to, arrow.color);
    });
  };

  useEffect(() => {
    redrawArrows();
  }, [arrows]);

  useEffect(() => {
    const handleResize = () => {
      redrawArrows();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [arrows]);

  const handleMouseDown = (square: string) => {
    setDragStart(square);
    setIsDrawing(true);
  };

  const handleMouseUp = (square: string) => {
    if (isDrawing && dragStart && dragStart !== square) {
      onArrowAdd({ from: dragStart, to: square, color: currentColor });
    }
    setDragStart(null);
    setIsDrawing(false);
  };

  return (
    <Card className="relative w-full max-w-[600px] aspect-square bg-card p-0 overflow-hidden">
      <div
        ref={boardRef}
        className="relative w-full h-full grid grid-cols-8 grid-rows-8"
        onMouseLeave={() => {
          setIsDrawing(false);
          setDragStart(null);
        }}
      >
        {ranks.map((rank, rowIndex) =>
          files.map((file, colIndex) => {
            const square = `${file}${rank}`;
            const isLight = (rowIndex + colIndex) % 2 === 0;

            return (
              <div
                key={square}
                className={`relative flex items-center justify-center cursor-pointer transition-all hover:opacity-80 ${
                  isLight ? 'bg-[hsl(var(--chess-light))]' : 'bg-[hsl(var(--chess-dark))]'
                }`}
                onMouseDown={() => handleMouseDown(square)}
                onMouseUp={() => handleMouseUp(square)}
              >
                <span
                  className={`text-xs font-medium absolute bottom-0.5 right-1 select-none ${
                    isLight ? 'text-[hsl(var(--chess-dark))]' : 'text-[hsl(var(--chess-light))]'
                  }`}
                >
                  {colIndex === 0 && rank}
                  {rowIndex === 7 && file}
                </span>
              </div>
            );
          })
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </Card>
  );
};

export default ChessBoard;
