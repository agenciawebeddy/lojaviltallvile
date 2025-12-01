import React, { useState, useRef } from 'react';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser'; // Importando a biblioteca EmailJS

const ContactForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null); // Usando useRef para capturar o formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Variáveis de configuração do EmailJS
  const publicKey = "jOZo1dRNn4uZBaV9T";
  // A privateKey não é usada diretamente no cliente para sendForm
  // const privateKey = "zCjfc4L9CVhrrgi1KxbaY"; 
  const templateId = "template_j8xf9aa";
  const serviceId = "YOUR_EMAILJS_SERVICE_ID"; // Crie uma variável para eu preencher depois.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 1. Prevenir o refresh.
    setIsLoading(true);
    setStatus('idle');
    setMessage(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setStatus('error');
      setMessage('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      // 2. Chamar emailjs.sendForm
      if (formRef.current) {
        await emailjs.sendForm(serviceId, templateId, formRef.current, {
          publicKey: publicKey,
          // privateKey não é uma opção válida para sendForm no cliente
        });
        setStatus('success');
        setMessage('Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.');
        setFormData({ name: '', email: '', phone: '', message: '' }); // Clear form
      } else {
        throw new Error("Formulário não encontrado.");
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      setStatus('error');
      setMessage(`Erro ao enviar mensagem: ${err.message || 'Tente novamente mais tarde.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Envie-nos uma Mensagem</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4"> {/* Atribuindo a ref ao formulário */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <input
            type="text"
            id="name"
            name="name" // Adicionado o atributo name para o EmailJS
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <input
            type="email"
            id="email"
            name="email" // Adicionado o atributo name para o EmailJS
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Telefone de Contato</label>
          <input
            type="tel"
            id="phone"
            name="phone" // Adicionado o atributo name para o EmailJS
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
          <textarea
            id="message"
            name="message" // Adicionado o atributo name para o EmailJS
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"
            required
          ></textarea>
        </div>

        {message && (
          <div className={`p-3 rounded-md flex items-center gap-2 ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm">{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:bg-red-300 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;