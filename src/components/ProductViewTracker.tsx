import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

interface ProductViewTrackerProps {
  productName: string;
  isVisible: boolean;
}

const ProductViewTracker: React.FC<ProductViewTrackerProps> = ({ productName, isVisible }) => {
  const [showTracker, setShowTracker] = useState(false);
  const [viewCount, setViewCount] = useState(0); // Novo estado para o contador

  useEffect(() => {
    if (isVisible) {
      // Gera um número aleatório entre 15 e 30
      const randomCount = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
      setViewCount(randomCount);

      // Mostra o tracker após um pequeno atraso
      const timer = setTimeout(() => {
        setShowTracker(true);
      }, 1000); // Atraso de 1 segundo para aparecer

      // Esconde o tracker após um tempo
      const hideTimer = setTimeout(() => {
        setShowTracker(false);
      }, 8000); // Fica visível por 7 segundos (1s de atraso + 7s visível)

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    } else {
      setShowTracker(false);
    }
  }, [isVisible, productName]);

  if (!showTracker) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex items-center gap-3 animate-fade-in-up z-50">
      <Eye size={20} className="text-red-500" />
      <p className="text-sm text-gray-800">
        <span className="font-bold">{viewCount} pessoas</span> estão visualizando <span className="font-bold">{productName}</span> agora!
      </p>
    </div>
  );
};

export default ProductViewTracker;