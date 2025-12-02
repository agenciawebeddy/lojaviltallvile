import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

// A chave pública deve ser carregada do ambiente.
// Usamos process.env.VITE_STRIPE_PUBLIC_KEY, que é injetada pelo vite.config.ts
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...');

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    stripePromise.then(s => {
      setStripe(s);
      setIsLoading(false);
    }).catch(err => {
      console.error("Failed to load Stripe:", err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-screen">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <p className="ml-3 text-gray-600">Carregando serviços de pagamento...</p>
      </div>
    );
  }
  
  if (!stripe) {
      return (
          <div className="flex justify-center items-center p-8 h-screen text-red-700">
              <p>Erro: A chave pública do Stripe não foi carregada. Verifique VITE_STRIPE_PUBLIC_KEY.</p>
          </div>
      );
  }

  return (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  );
};

export default StripeProvider;