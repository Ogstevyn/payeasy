"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftCircle, Wallet } from "lucide-react";
import { z } from "zod";

import AuthButton from "@/components/forms/AuthButton";
import AuthInput from "@/components/forms/AuthInput";
import FormError from "@/components/forms/FormError";
import { useWallet } from "@/hooks/useWallet";
import { createClient } from "@/lib/supabase/client";
import { 
  usernameSchema, 
  emailSchema, 
  passwordSchema, 
  stellarPublicKeySchema 
} from "@/lib/validation/input";

// ── Registration schema using validated schemas for security ─────────
const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema.optional().or(z.literal("")),
  password: passwordSchema,
  walletAddress: stellarPublicKeySchema,
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");

  let isConnected: boolean;
  let walletPublicKey: string | null;
  let connect: () => Promise<void>;
  let isWalletConnecting: boolean;

  try {
    const wallet = useWallet();
    isConnected = wallet.isConnected;
    walletPublicKey = wallet.publicKey;
    connect = wallet.connect;
    isWalletConnecting = wallet.isInitializing;
  } catch {
    isConnected = false;
    walletPublicKey = null;
    connect = async () => {};
    isWalletConnecting = false;
  }

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    // FIX 1: Only validate on submit, not on every keystroke.
    mode: "onSubmit",
    // FIX 2: All fields start as empty strings, not undefined.
    defaultValues: {
      username: "",
      email: "",
      password: "",
      walletAddress: "",
    },
  });

  const walletAddress = watch("walletAddress");

  // Sync wallet public key into form whenever it changes
  useEffect(() => {
    if (walletPublicKey) {
      setValue("walletAddress", walletPublicKey, { shouldValidate: true });
    }
  }, [walletPublicKey, setValue]);

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch {
      setError("Failed to connect wallet. Is Freighter installed?");
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            wallet_address: data.walletAddress,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          username: data.username,
          email: data.email,
          wallet_address: data.walletAddress,
        });

        if (profileError) {
          setError(profileError.message);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    }
  };

  const walletLabel = (() => {
    if (walletAddress) {
      return `Connected: ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
    }
    if (isWalletConnecting) return "Connecting…";
    return "Connect Freighter Wallet";
  })();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      {/* Back link */}
      <Link
        href="/browse"
        className="absolute left-8 top-8 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Back to browse"
      >
        <ArrowLeftCircle className="h-8 w-8" />
      </Link>

      <div className="w-full max-w-md space-y-8">
        {/* Heading */}
        <div className="text-center">
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Step 1 – Wallet */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Stellar Wallet{" "}
                <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                onClick={handleConnectWallet}
                disabled={isWalletConnecting || isConnected}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Wallet className="h-4 w-4 shrink-0" />
                <span className="truncate">{walletLabel}</span>
              </button>
              {errors.walletAddress && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.walletAddress.message}
                </p>
              )}
            </div>

            {/* Hidden input to track wallet address in form */}
            <input type="hidden" {...register("walletAddress")} />

            {/* Step 2 – Username */}
            <AuthInput
              id="username"
              label="Username"
              type="text"
              placeholder="e.g. alice_xlm"
              autoComplete="username"
              error={errors.username?.message}
              register={register("username")}
            />

            {/* Step 3 – Email (optional) */}
            <AuthInput
              id="email"
              label="Email address (optional)"
              type="email"
              placeholder="alice@example.com"
              autoComplete="email"
              error={errors.email?.message}
              register={register("email")}
            />

            {/* Step 4 – Password */}
            <AuthInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              register={register("password")}
            />

            <FormError message={error} />

            <AuthButton type="submit" isLoading={isSubmitting}>
              Create Account
            </AuthButton>
          </form>
        </div>
      </div>
    </div>
  );
}