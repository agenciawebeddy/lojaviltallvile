import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import PageHeader from './PageHeader';
import usePageHeader from '../hooks/usePageHeader';

const ResetPasswordPage: React.FC = () => {
  const { headerData, isLoading: isHeaderLoading } = usePageHeader('reset-password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    // Verifica se há um token de recuperação na URL (hash fragment)
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsTokenValid(true);
      // O Supabase SDK gerencia a sessão automaticamente a partir do hash,
      // então não precisamos extrair o token manualmente, apenas garantir que o tipo é 'recovery'.
    } else {
      setError('Link de redefinição de senha inválido ou expirado.');
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    // O Supabase usa a sessão atual (obtida do hash) para atualizar a senha do usuário
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Sua senha foi redefinida com sucesso! Você pode fazer login agora.');
      // Limpa o hash da URL para evitar reuso
      window.history.replaceState(null, '', window.location.pathname);
    }
    setLoading(false);
  };

  if (isHeaderLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader 
        title={headerData?.title || "Redefinir Senha"}
        description={headerData?.description || "Crie uma nova senha para sua conta."}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          
          <div className="text-center mb-6">
            <Lock className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Nova Senha</h2>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-200 text-green-800 text-sm rounded-lg p-4 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg p-4 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {!isTokenValid && !error && (
            <div className="text-center text-gray-600">
                <p>Aguardando o link de redefinição de senha...</p>
            </div>
          )}

          {isTokenValid && !success && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="password">
                  Nova Senha
                </label>
                <input
                  id="password"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="confirm-password">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirm-password"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Redefinir Senha'}
              </button>
            </form>
          )}
          
          {success && (
            <button onClick={() => window.location.href = '/'} className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-600">
                Ir para a Página Inicial
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;