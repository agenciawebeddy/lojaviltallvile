import React from 'react';
import { X } from 'lucide-react';

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  onNavigate: (page: string) => void;
}

const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  buttonText,
  buttonLink,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleButtonClick = () => {
    if (buttonLink) {
      onNavigate(buttonLink);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors z-10">
          <X size={24} />
        </button>

        {imageUrl && (
          <div className="relative h-48 w-full">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}

        <div className="p-6 text-center relative">
          <h2 className={`text-2xl font-bold text-gray-900 ${imageUrl ? 'mt-0' : 'mt-4'} mb-2`}>{title}</h2>
          {description && <p className="text-gray-600 mb-4">{description}</p>}

          {buttonText && buttonLink && (
            <button
              onClick={handleButtonClick}
              className="mt-4 bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;