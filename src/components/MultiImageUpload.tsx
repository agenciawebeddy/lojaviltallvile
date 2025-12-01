import React from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, UploadCloud, X } from 'lucide-react';

interface MultiImageUploadProps {
  onImagesUpdate: (urls: string[]) => void;
  currentImageUrls: string[];
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ onImagesUpdate, currentImageUrls }) => {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar pelo menos uma imagem para fazer o upload.');
      }

      // Correção 1: Garantir que 'files' seja um array de File
      const files = Array.from(event.target.files) as File[];
      const newUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Correção 2: 'file' agora é do tipo File, que é compatível com FileBody
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (!data.publicUrl) {
          throw new Error('Não foi possível obter a URL pública da imagem.');
        }
        newUrls.push(data.publicUrl);
      }

      onImagesUpdate([...currentImageUrls, ...newUrls]);
      // Limpa o input para permitir o upload do mesmo arquivo novamente
      event.target.value = ''; 

    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    onImagesUpdate(currentImageUrls.filter(url => url !== urlToRemove));
  };

  return (
    <div className="w-full space-y-4">
      <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-gray-50 transition-colors">
        <div className="text-center">
          {uploading ? (
            <>
              <Loader2 className="mx-auto h-6 w-6 text-gray-400 animate-spin" />
              <p className="mt-1 text-sm text-gray-500">Enviando {currentImageUrls.length} imagens...</p>
            </>
          ) : (
            <>
              <UploadCloud className="mx-auto h-6 w-6 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">Clique para adicionar mais imagens à galeria</p>
            </>
          )}
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept="image/*" multiple />
      </label>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {currentImageUrls.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          {currentImageUrls.map((url, index) => (
            <div key={index} className="relative group w-20 h-20 border border-gray-300 rounded-md overflow-hidden">
              <img src={url} alt={`Gallery image ${index}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(url)}
                className="absolute top-0 right-0 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover imagem"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;