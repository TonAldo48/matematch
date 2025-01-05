"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export function SignIn() {
  const { user, loading, signIn, error } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await signIn(email, password)
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to MateMatch</h1>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button 
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/signup" className="text-teal-600 hover:text-teal-700">
          Sign up
        </Link>
      </p>
    </div>
  )
} 