'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se proporcionó un token de verificación.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/verify-email/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Tu email ha sido verificado exitosamente.');
        } else {
          setStatus('error');
          setMessage(data.detail || 'El token es inválido o ha expirado.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Hubo un error al verificar tu email. Por favor intenta de nuevo.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-j-light-bg to-j-light-bg/80 dark:from-j-dark-bg dark:to-j-dark-bg/80 p-4">
      <div className="max-w-md w-full bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6">
              <svg className="animate-spin w-full h-full text-warm-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-2">
              Verificando tu email...
            </h1>
            <p className="text-j-light-text/60 dark:text-j-dark-text/60">
              Por favor espera un momento.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-2">
              Email Verificado
            </h1>
            <p className="text-j-light-text/60 dark:text-j-dark-text/60 mb-6">
              {message}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-warm-glow hover:bg-warm-glow/90 text-white font-medium rounded-xl transition-colors"
            >
              Ir al Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-2">
              Error de Verificación
            </h1>
            <p className="text-j-light-text/60 dark:text-j-dark-text/60 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/"
                className="block px-6 py-3 bg-warm-glow hover:bg-warm-glow/90 text-white font-medium rounded-xl transition-colors"
              >
                Volver al Inicio
              </Link>
              <p className="text-sm text-j-light-text/50 dark:text-j-dark-text/50">
                ¿Necesitas un nuevo enlace?{' '}
                <Link href="/dashboard" className="text-warm-glow hover:underline">
                  Solicitar reenvío
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
