import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaPinterest, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { Globe } from 'lucide-react'; // Fallback icon

interface SocialIconRendererProps {
  name: string;
  iconUrl?: string | null; // Tornando a URL do ícone opcional
  size?: number;
  className?: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  pinterest: FaPinterest,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
};

const SocialIconRenderer: React.FC<SocialIconRendererProps> = ({ name, iconUrl, size = 20, className = '' }) => {
  const normalizedName = name.toLowerCase().replace(/\s/g, '');
  const IconComponent = iconMap[normalizedName];

  // 1. Prioriza o ícone do mapa de ícones
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // 2. Se não encontrar, usa a imagem customizada (se existir)
  if (iconUrl) {
    return <img src={iconUrl} alt={name} style={{ width: size, height: size }} className={`object-contain ${className}`} />;
  }

  // 3. Se não houver nenhum dos dois, usa o fallback do globo
  return <Globe size={size} className={className} />;
};

export default SocialIconRenderer;