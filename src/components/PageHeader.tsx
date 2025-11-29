import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  imageUrl?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, imageUrl }) => {
  const defaultImage = 'https://picsum.photos/seed/pageheader/1920/300';
  const bgImage = imageUrl || defaultImage;

  return (
    <div className="relative h-[200px] md:h-[250px] flex items-center justify-center text-center">
      {/* Background Image and Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
          {title}
        </h1>
        <p className="mt-2 text-md md:text-lg text-gray-300 max-w-3xl">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;