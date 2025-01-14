'use client';

import { useEffect, useState } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Hero } from '@/components/ui/animated-hero';

export default function VerifyEmail() {
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('isNewUser') === 'true';

  useEffect(() => {
    async function verifyEmail() {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          // If missing email, prompt user for it
          email = window.prompt('Please provide your email for confirmation');
        }

        try {
          await signInWithEmailLink(auth, email!, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          router.push('/');
        } catch (err: any) {
          setError(err.message);
          setIsVerifying(false);
        }
      } else {
        setError('Invalid verification link');
        setIsVerifying(false);
      }
    }

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto -mt-20">
        <div className="flex justify-center">
          <Image
            src="/images/peeps.svg"
            alt="People illustration"
            width={600}
            height={200}
            priority
            className="-mb-4"
          />
        </div>
        <div className="mb-4">
          <Hero />
        </div>
        <div className="w-full max-w-[350px] mx-auto px-4">
          <div className="flex flex-col text-center mb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isVerifying ? 'Verifying your email' : error ? 'Verification failed' : 'Success!'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isVerifying ? (
                'Please wait while we verify your email...'
              ) : error ? (
                <>
                  {error}. Please try{' '}
                  <a href={isNewUser ? '/signup' : '/signin'} className="text-[#FDB241] hover:text-[#FDB241]/90">
                    signing {isNewUser ? 'up' : 'in'} again
                  </a>
                </>
              ) : (
                'You have been successfully signed in!'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 