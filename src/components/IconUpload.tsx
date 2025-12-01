import React from 'react'
import { supabase } from '../integrations/supabase/client'
import { Loader2, UploadCloud, X } from 'lucide-react'

interface IconUploadProps {
  onIconUpload: (url: string) => void;
  currentIconUrl?: string | null;
}

const IconUpload: React.FC<IconUploadProps> = ({ onIconUpload, currentIconUrl }) => {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar um ícone para fazer o upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('category-icons')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('category-icons')
        .getPublicUrl(filePath)

      if (!data.publicUrl) {
        throw new Error('Não foi possível obter a URL pública do ícone.')
      }

      onIconUpload(data.publicUrl)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeIcon = () => {
    onIconUpload('');
  }

  return (
    <div className="w-full">
      {currentIconUrl ? (
        <div className="relative group w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <img src={currentIconUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
          <button
            onClick={removeIcon}
            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remover ícone"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-gray-50 transition-colors">
          <div className="text-center">
            {uploading ? (
              <>
                <Loader2 className="mx-auto h-6 w-6 text-gray-400 animate-spin" />
                <p className="mt-1 text-xs text-gray-500">Enviando...</p>
              </>
            ) : (
              <>
                <UploadCloud className="mx-auto h-6 w-6 text-gray-400" />
                <p className="mt-1 text-xs text-gray-600">Enviar ícone</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept="image/svg+xml,image/png" />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default IconUpload