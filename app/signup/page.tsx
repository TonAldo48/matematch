'use client';

import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hero } from '@/components/ui/animated-hero';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/auth/verify?isNewUser=true',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-4">
            <Hero />
          </div>
          <div className="w-full max-w-[350px] mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Check your email
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                We've sent a sign-up link to {email}. Click the link to create your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div>
          <Hero />
        </div>
        <div className="w-full max-w-[350px] mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Create an account
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email to create your account
            </p>
          </div>
          <form className="mt-4" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-sm text-center mb-3">{error}</div>
            )}
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FDB241] focus-visible:border-[#FDB241] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#FDB241] px-4 py-2 text-sm font-medium text-white hover:bg-[#FDB241]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FDB241] focus-visible:ring-offset-1 ring-offset-white disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? 'Sending link...' : 'Send sign-up link'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#FDB241] hover:text-[#FDB241]/90">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 