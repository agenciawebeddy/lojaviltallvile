import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { AlertCircle, Loader2, Mail } from 'lucide-react'; 

const AuthPage = () => {
  const [view, setView] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      setError(error.message);
    } else if (data.user && data.user.identities?.length === 0) {
      setError("Usuário com este e-mail já existe.");
    } else {
      setMessage('Cadastro realizado! Verifique seu e-mail para confirmar sua conta.');
    }
    setLoading(false);
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, 
    });

    if (error) {
        setError(error.message);
    } else {
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada para redefinir sua senha.');
    }
    setLoading(false);
  };
  
  // Removendo handleSocialSignIn

  const toggleView = (newView: 'signIn' | 'signUp' | 'forgotPassword') => {
    setView(newView);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const renderForm = () => {
    switch (view) {
      case 'signIn':
      case 'signUp':
        return (
          <form onSubmit={view === 'signIn' ? handleSignIn : handleSignUp} className="space-y-4">
            {view === 'signUp' && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="full-name">
                  Nome Completo
                </label>
                <input
                  id="full-name"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@exemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="password">
                Senha
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
            
            {view === 'signIn' && (
                <div className="text-right">
                    <button type="button" onClick={() => toggleView('forgotPassword')} className="text-sm text-red-500 hover:text-red-600">
                        Esqueci minha senha
                    </button>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : (view === 'signIn' ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>
        );
      case 'forgotPassword':
        return (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
                <Mail size={20} />
                <h3 className="font-semibold">Redefinir Senha</h3>
            </div>
            <p className="text-sm text-gray-500">
                Insira seu e-mail para receber um link de redefinição de senha.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="email-reset">
                E-mail
              </label>
              <input
                id="email-reset"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@exemplo.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Enviar Link de Redefinição'}
            </button>
            <button type="button" onClick={() => toggleView('signIn')} className="w-full text-sm text-gray-500 hover:text-gray-800 mt-2">
                Voltar para o Login
            </button>
          </form>
        );
    }
  };

  return (
    <div className="w-full max-w-md mt-10 p-10 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-500">Viltal Ville</h1>
        <p className="text-xs text-gray-500 -mt-1">A sua nova loja </p>
        <p className="mt-4 text-gray-600">
          {view === 'signIn' ? 'Acesse sua conta para continuar' : view === 'signUp' ? 'Crie uma nova conta' : 'Recuperação de Senha'}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg p-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-green-100 border border-green-200 text-green-800 text-sm rounded-lg p-3">
          {message}
        </div>
      )}

      {renderForm()}
      
      {/* Removendo o bloco de login social */}

      {view !== 'forgotPassword' && (
        <p className="text-sm text-center text-gray-600">
          {view === 'signIn' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
          <button onClick={() => toggleView(view === 'signIn' ? 'signUp' : 'signIn')} className="font-medium text-red-500 hover:text-red-600 ml-1">
            {view === 'signIn' ? 'Cadastre-se' : 'Entre'}
          </button>
        </p>
      )}
    </div>
  );
};

export default AuthPage;