import React from 'react'
import { supabase } from '../integrations/supabase/client'
import { Loader2, UploadCloud, X } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, currentImageUrl }) => {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer o upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      if (!data.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem.')
      }

      onImageUpload(data.publicUrl)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    onImageUpload('');
  }

  return (
    <div className="w-full">
      {currentImageUrl ? (
        <div className="relative group w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <img src={currentImageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remover imagem"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-gray-50 transition-colors">
          <div className="text-center">
            {uploading ? (
              <>
                <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Enviando...</p>
              </>
            ) : (
              <>
                <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Clique para enviar</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept="image/*" />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default ImageUpload