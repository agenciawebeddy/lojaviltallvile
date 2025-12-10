import React, { useState } from 'react';
import { addShopHeaderToDatabase } from '../utils/addShopHeader';
import { AlertCircle, CheckCircle, Play } from 'lucide-react';

/**
 * Componente temporário para adicionar o cabeçalho da página Shop
 * Adicione este componente ao AdminDashboard temporariamente
 * Após executar com sucesso, você pode removê-lo
 */
const AddShopHeaderButton: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const handleAddShopHeader = async () => {
        setStatus('loading');
        setMessage('Processando...');

        const result = await addShopHeaderToDatabase();

        if (result.success) {
            setStatus('success');
            setMessage('Cabeçalho da página Shop adicionado com sucesso! Recarregue a página para ver as mudanças.');
        } else {
            setStatus('error');
            setMessage(`Erro: ${result.error?.message || 'Erro desconhecido'}`);
        }
    };

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={20} />
                Configuração Necessária
            </h3>
            <p className="text-sm text-gray-700 mb-4">
                Clique no botão abaixo para adicionar a página "Shop" aos cabeçalhos gerenciáveis.
                Você só precisa fazer isso uma vez.
            </p>

            <button
                onClick={handleAddShopHeader}
                disabled={status === 'loading' || status === 'success'}
                className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {status === 'loading' ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processando...
                    </>
                ) : status === 'success' ? (
                    <>
                        <CheckCircle size={18} />
                        Concluído!
                    </>
                ) : (
                    <>
                        <Play size={18} />
                        Adicionar Página Shop aos Cabeçalhos
                    </>
                )}
            </button>

            {message && (
                <div className={`mt-4 p-3 rounded-md flex items-start gap-2 ${status === 'success' ? 'bg-green-100 text-green-800' :
                        status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                    }`}>
                    {status === 'success' && <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />}
                    {status === 'error' && <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
                    <span className="text-sm">{message}</span>
                </div>
            )}

            {status === 'success' && (
                <p className="text-xs text-gray-600 mt-3">
                    💡 Dica: Após recarregar a página, você pode remover este componente do código.
                </p>
            )}
        </div>
    );
};

export default AddShopHeaderButton;
