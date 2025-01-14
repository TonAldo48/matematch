'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hero } from '@/components/ui/animated-hero';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/auth/verify',
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
                We've sent a sign-in link to {email}. Click the link to sign in to your account.
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
        <div className="mb-4">
          <Hero />
        </div>
        <div className="w-full max-w-[350px] mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your account
            </p>
          </div>
          <form className="mt-4" onSubmit={handleEmailPasswordSignIn}>
            {error && (
              <div className="text-red-500 text-sm text-center mb-3">{error}</div>
            )}
            <div className="space-y-3">
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
              <input
                id="password"
                name="password"
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FDB241] focus-visible:border-[#FDB241] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-[#FDB241] px-4 py-2 text-sm font-medium text-white hover:bg-[#FDB241]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FDB241] focus-visible:ring-offset-1 ring-offset-white disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleEmailLinkSignIn}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FDB241] disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? 'Sending link...' : 'Sign in with email link'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#FDB241] hover:text-[#FDB241]/90">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 