
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
import { useAuth } from "@/lib/auth";
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
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showVerification, setShowVerification] = useState(false);

  

const done = async () => {
  const destination = next || "/account";

  // Wait until the app's auth provider recognizes the signed-in user.
  for (let i = 0; i < 20; i++) {
    if (!loading && user) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  await nav({
    to: destination,
    replace: true,
  });
};



  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (busy) return;

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
          displayName: f.name.trim(),
        });

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

        if (!c.user.emailVerified) {
          setShowVerification(true);
          toast.error("Please verify your email before continuing.");
          return;
        }

        toast.success("Welcome!");
        await done();
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

  const google = async () => {
    if (busy) return;

    setBusy(true);

    try {
      await signInWithPopup(
        getFirebase().auth,
        new GoogleAuthProvider(),
      );

      toast.success("Welcome!");
      await done();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Google sign-in failed",
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

  const reset = async () => {
    if (!f.email) {
      toast.error("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(
        getFirebase().auth,
        f.email,
      );

      toast.success("Reset link sent to your email");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace("Firebase: ", "")
          : "Could not send password reset email",
      );
    }
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
            type="submit"
            disabled={busy}
            className="w-full tracking-widest"
            size="lg"
          >
            {busy
              ? "PLEASE WAIT..."
              : mode === "in"
                ? "SIGN IN"
                : "CREATE ACCOUNT"}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          disabled={busy}
          className="mt-3 w-full"
          onClick={google}
        >
          {busy ? "PLEASE WAIT..." : "Continue with Google"}
        </Button>

        <div className="mt-6 flex justify-between text-sm">
          <button
            type="button"
            className="underline"
            disabled={busy}
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setShowVerification(false);
            }}
          >
            {mode === "in"
              ? "New here? Create account"
              : "Have an account? Sign in"}
          </button>

          {mode === "in" && (
            <button
              type="button"
              className="underline"
              disabled={busy}
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
