import { useState } from 'react';
import ChessBoard from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Arrow {
  from: string;
  to: string;
  color: string;
}

const Index = () => {
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [currentColor, setCurrentColor] = useState('hsl(var(--arrow-green))');

  const colors = [
    { name: 'Зелёный', value: 'hsl(var(--arrow-green))' },
    { name: 'Красный', value: 'hsl(var(--arrow-red))' },
    { name: 'Синий', value: 'hsl(var(--arrow-blue))' },
    { name: 'Оранжевый', value: 'hsl(var(--arrow-orange))' },
  ];

  const handleArrowAdd = (arrow: Arrow) => {
    setArrows([...arrows, arrow]);
  };

  const handleClearArrows = () => {
    setArrows([]);
    toast.success('Все стрелки удалены');
  };

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      arrows: arrows.map((arrow) => ({
        from: arrow.from,
        to: arrow.to,
        color: arrow.color,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lichess-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Анализ экспортирован');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Lichess Arrow Tool
          </h1>
          <p className="text-muted-foreground text-lg">
            Рисуйте стрелки на доске для анализа партий
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6 items-start">
          <div className="flex justify-center">
            <ChessBoard
              arrows={arrows}
              onArrowAdd={handleArrowAdd}
              currentColor={currentColor}
            />
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Palette" size={20} />
                Цвет стрелки
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {colors.map((color) => (
                  <Button
                    key={color.value}
                    variant={currentColor === color.value ? 'default' : 'outline'}
                    onClick={() => setCurrentColor(color.value)}
                    className="w-full"
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Управление
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-3">
                  Стрелок на доске: <span className="font-semibold text-foreground">{arrows.length}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleClearArrows}
                  disabled={arrows.length === 0}
                  className="w-full"
                >
                  <Icon name="Trash2" size={18} className="mr-2" />
                  Очистить доску
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={arrows.length === 0}
                  className="w-full"
                >
                  <Icon name="Download" size={18} className="mr-2" />
                  Экспортировать анализ
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Icon name="Info" size={16} />
                Как использовать
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Зажмите клетку и перетащите на другую</li>
                <li>• Выберите цвет перед рисованием</li>
                <li>• Экспортируйте для сохранения</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
