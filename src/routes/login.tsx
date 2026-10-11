import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFirebase } from "@/lib/firebase";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () =>
    seo(
      "Sign In",
      "Sign in or create your Sreeja's Bridal Boutique account.",
    ),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const nav = useNavigate();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showVerification, setShowVerification] = useState(false);

  const done = () => nav({ to: (next as "/") ?? "/account" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      const { auth } = getFirebase();

      if (mode === "up") {
        const c = await createUserWithEmailAndPassword(
          auth,
          f.email,
          f.password,
        );

        await updateProfile(c.user, {
          displayName: f.name,
        });

        // Send verification email for newly created accounts
        await sendEmailVerification(c.user);

        toast.success(
          "Account created. Please check your email to verify your account.",
        );

        setShowVerification(true);
      } else {
        const c = await signInWithEmailAndPassword(
          auth,
          f.email,
          f.password,
        );

        // Check whether this email/password account is verified
        if (!c.user.emailVerified) {
          setShowVerification(true);
          toast.error("Please verify your email before continuing.");
          return;
        }

        toast.success("Welcome!");
        done();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace("Firebase: ", "")
          : "Could not sign in",
      );
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    try {
      const { auth } = getFirebase();

      if (!auth.currentUser) {
        toast.error("Please sign in first.");
        return;
      }

      await sendEmailVerification(auth.currentUser);

      toast.success("Verification email sent. Please check your inbox.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace("Firebase: ", "")
          : "Could not send verification email",
      );
    }
  };

  const google = async () => {
    try {
      await signInWithPopup(
        getFirebase().auth,
        new GoogleAuthProvider(),
      );

      done();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Google sign-in failed",
      );
    }
  };

  const reset = async () => {
    if (!f.email) {
      return toast.error("Enter your email first");
    }

    await sendPasswordResetEmail(
      getFirebase().auth,
      f.email,
    ).then(
      () => toast.success("Reset link sent to your email"),
      (e) => toast.error(e.message),
    );
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-8 text-center font-display text-4xl">
          {mode === "in" ? "Welcome back" : "Create account"}
        </h1>

        {showVerification && (
          <div className="mb-6 rounded-lg border p-4 text-sm">
            <p className="font-medium">
              Email verification required
            </p>

            <p className="mt-1 text-muted-foreground">
              We sent a verification link to your email.
              Please check your inbox and spam folder.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={resendVerification}
            >
              RESEND VERIFICATION EMAIL
            </Button>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === "up" && (
            <div>
              <Label htmlFor="n">Full name</Label>
              <Input
                id="n"
                required
                value={f.name}
                onChange={(e) =>
                  setF({
                    ...f,
                    name: e.target.value,
                  })
                }
              />
            </div>
          )}

          <div>
            <Label htmlFor="e">Email</Label>
            <Input
              id="e"
              type="email"
              required
              value={f.email}
              onChange={(e) =>
                setF({
                  ...f,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="p">Password</Label>
            <Input
              id="p"
              type="password"
              minLength={6}
              required
              value={f.password}
              onChange={(e) =>
                setF({
                  ...f,
                  password: e.target.value,
                })
              }
            />
          </div>

          <Button
            disabled={busy}
            className="w-full tracking-widest"
            size="lg"
          >
            {mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}
          </Button>
        </form>

        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={google}
        >
          Continue with Google
        </Button>

        <div className="mt-6 flex justify-between text-sm">
          <button
            className="underline"
            onClick={() =>
              setMode(mode === "in" ? "up" : "in")
            }
          >
            {mode === "in"
              ? "New here? Create account"
              : "Have an account? Sign in"}
          </button>

          {mode === "in" && (
            <button
              className="underline"
              onClick={reset}
            >
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}