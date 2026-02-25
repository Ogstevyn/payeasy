"use client";

import { ArrowLeftCircle, Wallet } from "lucide-react";
import { RegisterFormData, registerSchema } from "../../../lib/validators/auth";
import { useEffect, useState } from "react";
import AuthButton from "../../../components/forms/AuthButton";
import AuthInput from "../../../components/forms/AuthInput";
import FormError from "../../../components/forms/FormError";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../hooks/useWallet";
import { zodResolver } from "@hookform/resolvers/zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  const connectWallet = async () => {
    try {
      await connect();
    } catch {
      setError("Failed to connect wallet");
    }
  };
  // FIX 3: shouldValidate: false so connecting a wallet doesn't trigger
  useEffect(() => {
    if (walletPublicKey) {
      setValue("walletAddress", walletPublicKey, { shouldValidate: false });
    }
  }, [walletPublicKey, setValue]);

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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <Link
        href="/browse"
        className="absolute left-8 top-8 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeftCircle className="h-8 w-8" />
      </Link>
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-white p-8 shadow dark:bg-gray-800">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AuthInput
                id="username"
                label="Username"
                type="text"
                placeholder="johndoe"
                error={errors.username?.message}
                register={register("username")}
              />

              <AuthInput
                id="email"
                label="Email address"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                register={register("email")}
              />

              <AuthInput
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                register={register("password")}
              />
              {/*
                FIX 4: Register walletAddress as a hidden input so react-hook-form
                actually tracks the field. Without this, the field is unknown to RHF
                and its value stays `undefined` in the form state — causing Zod to
                throw "expected string, received undefined" on any validation pass.
              */}
              <input type="hidden" {...register("walletAddress")} />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Wallet Connection
                </label>
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={isWalletConnecting || isConnected}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Wallet className="h-4 w-4" />
                  {walletAddress
                    ? `Connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                    : isWalletConnecting
                      ? "Connecting..."
                      : "Connect Freighter Wallet"}
                </button>
                {errors.walletAddress && (
                  <p className="text-sm text-red-600">{errors.walletAddress.message}</p>
                )}
              </div>

              <FormError message={error} />

              <AuthButton type="submit" isLoading={isSubmitting}>
                Create Account
              </AuthButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}