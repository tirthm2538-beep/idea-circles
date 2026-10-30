"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { login, signup, AuthState } from "../auth/actions";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  // useActionState hooks into our Server Actions to capture errors/messages and pending state
  const [loginState, loginAction, isLoginPending] = useActionState<AuthState, FormData>(
    login,
    {}
  );
  const [signupState, signupAction, isSignupPending] = useActionState<AuthState, FormData>(
    signup,
    {}
  );

  const activeState = isSignUp ? signupState : loginState;
  const isPending = isSignUp ? isSignupPending : isLoginPending;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand logo / title */}
        <Link href="/" className="flex justify-center mb-2">
          <span className="text-2xl font-bold tracking-tight text-indigo-600">
            Idea Circles
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account? " : "Don't have an account yet? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition cursor-pointer underline"
          >
            {isSignUp ? "Log in here" : "Sign up here"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200">
          {/* Error Message Alert */}
          {activeState.error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {activeState.error}
            </div>
          )}

          {/* Success Message Alert (e.g. email verification notice) */}
          {activeState.success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              {activeState.success}
            </div>
          )}

          <form action={isSignUp ? signupAction : loginAction} className="space-y-5">
            {/* Display Name field (only visible during Sign Up) */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-slate-700"
                >
                  Your Name (or nickname)
                </label>
                <div className="mt-1">
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={100}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  maxLength={100}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 6 characters long.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition cursor-pointer"
              >
                {isPending
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </div>
          </form>

          {/* Quick link back home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 transition"
            >
              &larr; Back to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

