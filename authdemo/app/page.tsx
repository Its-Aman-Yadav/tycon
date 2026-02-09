"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import { auth, db } from "@/lib/firebase";
import { arrayUnion } from "firebase/firestore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { FailureModal } from "@/components/ui/failure-modal";
import { AlertModal } from "@/components/ui/alert-modal";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";


type Flash = { type: "error" | "success"; text: string } | null;
const DEFAULT_ROLE = "user";

async function logWeeklyActivity(uid: string) {
  const today = dayjs().format("YYYY-MM-DD"); // NOT utc(), just local date

  const ref = doc(db, "weeklyActivity", uid);

  try {
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        userId: uid,
        days: [today],
        lastLoginDate: today,
        timestamp: serverTimestamp(),
      });
    } else {
      const data = snap.data();
      const days = data.days || [];

      if (!days.includes(today)) {
        await updateDoc(ref, {
          days: arrayUnion(today),
          lastLoginDate: today,
          timestamp: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.error("Error logging weekly activity:", err);
  }
}

const getEmailDomain = (email: string): string => {
  return email?.split("@")[1]?.toLowerCase() || "";
};

async function updateLoginStreak(uid: string) {
  const ref = doc(db, "streaks", uid);
  const snap = await getDoc(ref);

  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  if (!snap.exists()) {
    await setDoc(ref, {
      currentStreak: 1,
      maxStreak: 1,
      lastLoginDate: today,
    });
    return;
  }

  const data = snap.data();
  const lastLogin = data.lastLoginDate;
  const prevCurrent = data.currentStreak || 0;
  const prevMax = data.maxStreak || 0;

  if (lastLogin === today) return;

  let newStreak = 1;
  if (lastLogin === yesterday) {
    newStreak = prevCurrent + 1;
  }

  const newMax = Math.max(prevMax, newStreak);

  await setDoc(ref, {
    currentStreak: newStreak,
    maxStreak: newMax,
    lastLoginDate: today,
  });
}

export default function Login() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Flash>(null);
  const [failureModalOpen, setFailureModalOpen] = useState(false);
  const [failureText, setFailureText] = useState("");
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => { });
  }, []);

  const upsertUserProfile = async (
    uid: string,
    displayName?: string | null,
    email?: string | null,
    photoURL?: string | null
  ) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        role: DEFAULT_ROLE,
        name: displayName || "",
        email: email || "",
        photoURL: photoURL || "",
        provider: "google",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        name: displayName || snap.data().name || "",
        email: email || snap.data().email || "",
        photoURL: photoURL || snap.data().photoURL || "",
        updatedAt: serverTimestamp(),
      });
    }
  };

  const goNext = async (uid: string) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    const role = (data?.role as string) || DEFAULT_ROLE;
    const completed = Boolean(data?.completedProfile);

    const email = data?.email || auth.currentUser?.email;
    const domain = getEmailDomain(email);

    if (domain) {
      localStorage.setItem("emailDomain", domain);
    }

    if (role === "student") {
      await updateLoginStreak(uid);
      await logWeeklyActivity(uid);
    }

    router.replace(completed ? `/${role}/dashboard` : "/auth/onboarding");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          await upsertUserProfile(
            res.user.uid,
            res.user.displayName,
            res.user.email,
            res.user.photoURL
          );
          await goNext(res.user.uid);
        }
      } catch { }
    })();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!email || !pwd) {
      setMsg({ type: "error", text: t("msgFillFields") });
      return;
    }

    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      await cred.user.reload();
      const isVerified = cred.user.emailVerified;

      if (!isVerified) {
        setAlertText(
          language === "ar"
            ? "يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول."
            : "Please verify your email before logging in."
        );
        setAlertModalOpen(true);
        return;
      }

      await goNext(cred.user.uid);
    } catch (err: any) {
      const code = err?.code || "";
      let text = t("msgFail");
      if (code === "auth/invalid-credential" || code === "auth/wrong-password")
        text = t("msgIncorrect");
      if (code === "auth/user-not-found") text = t("msgNotFound");
      if (code === "auth/too-many-requests") text = t("msgTooMany");

      setFailureText(text);
      setFailureModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setMsg(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      await upsertUserProfile(
        cred.user.uid,
        cred.user.displayName,
        cred.user.email,
        cred.user.photoURL
      );
      await goNext(cred.user.uid);
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user"
      ) {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          await signInWithRedirect(auth, provider);
          return;
        } catch {
          setFailureText(t("msgGoogleFail"));
          setFailureModalOpen(true);
        }
      } else {
        setFailureText(t("msgGoogleFail"));
        setFailureModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row overflow-x-hidden bg-white" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Left panel */}
      <div className="relative m-4 flex w-full md:w-1/2 flex-col justify-between rounded-tr-3xl rounded-bl-3xl bg-slate-50 hidden md:flex overflow-hidden border border-slate-100">
        <div className="flex flex-col ltr:pl-12 rtl:pr-12 pt-16 pb-8 ltr:text-left rtl:text-right relative z-20">
          <h1 className="w-[90%] font-bold leading-[1.1] md:w-[60%] text-6xl sm:text-2xl md:text-4xl lg:text-6xl text-black">
            {t("newToNoor")}
          </h1>
          <p className="pt-8 text-sm md:text-base md:w-[65%] text-gray-700">
            {t("newToNoorDesc")}
          </p>
          <div className="pt-12">
            <button
              type="button"
              onClick={() => router.push("/auth/signup")}
              className="rounded-full bg-black px-6 py-2 text-white cursor-pointer hover:bg-gray-800 transition-colors"
            >
              {t("register")}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full md:w-1/2 flex-col bg-white">
        <div className="p-4 pt-12 md:pt-24 flex flex-col items-center md:items-start">
          <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] md:w-[60%] ltr:text-left rtl:text-right text-center md:text-left">
            {t("login")}
          </h2>
          <p className="pt-[10px] text-sm md:text-base md:w-[65%] ltr:text-left rtl:text-right text-center md:text-left">
            {t("loginDesc")}
          </p>

          <div className="p-2 pb-6 mt-4 md:p-0 md:mt-0 relative z-10 w-full md:w-auto">
            <form
              id="emailLoginForm"
              onSubmit={handleEmailLogin}
              className="mt-8 md:mt-12 w-full md:w-[400px] rounded-lg"
            >
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm md:text-sm font-medium text-gray-700"
                >
                  {t("email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("enterEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white"
                  required
                />
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="password"
                    className="block text-sm md:text-sm font-medium text-gray-700"
                  >
                    {t("password")}
                  </label>
                  <a
                    href="/auth/forgot-password"
                    className="text-xs md:text-xs underline text-gray-500 hover:text-gray-700 cursor-pointer block md:hidden"
                  >
                    {t("shortforgotPassword")}
                  </a>
                </div>

                <div className="relative flex w-full">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("enterPassword")}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white ltr:pr-10 rtl:pl-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.301M6.1 6.1A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.96 9.96 0 01-1.551 2.75M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 block md:flex gap-3">
              <button
                type="submit"
                form="emailLoginForm"
                disabled={loading}
                className="md:w-auto w-full rounded-full bg-black px-8 py-3 text-white disabled:opacity-50 cursor-pointer text-sm font-semibold"
              >
                {loading ? t("loading") : t("loginBtn")}
              </button>

              <div className="flex md:hidden items-center justify-center my-4">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="px-3 text-gray-400 text-sm font-medium">OR</span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="md:w-auto w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-3 text-black disabled:opacity-50 cursor-pointer transition-colors hover:bg-slate-50"
              >
                <span className="text-sm font-semibold">{t("signInWithGoogle")}</span>
              </button>
            </div>

            {msg && (
              <p className={`mt-3 text-sm ${msg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                {msg.text}
              </p>
            )}
          </div>

          <div className="hidden md:block ltr:pl-[1vw] rtl:pr-[1vw] pt-6 relative z-10 w-full text-left">
            <a
              href="/auth/forgot-password"
              className="text-sm underline text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {t("forgotPassword")}
            </a>
          </div>

          <div className="block md:hidden text-center mt-6">
            <p className="text-gray-600">{t("don'tHaveAccount")}</p>
            <a
              href="/auth/signup"
              className="font-semibold text-black hover:text-blue-600 transition-colors cursor-pointer"
            >
              {t("register")}
            </a>
          </div>
        </div>
      </div>

      <FailureModal
        isOpen={failureModalOpen}
        onClose={() => setFailureModalOpen(false)}
        title={language === "ar" ? "فشل تسجيل الدخول" : "Login Failed"}
        description={failureText}
        primaryText={language === "ar" ? "حاول مرة أخرى" : "Try again"}
        secondaryText={language === "ar" ? "إلغاء" : "Cancel"}
        variant="default"
      />

      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title={language === "ar" ? "تنبيه" : "Alert"}
        description={alertText}
        primaryText={language === "ar" ? "حسناً" : "OK"}
        secondaryText={language === "ar" ? "إلغاء" : "Cancel"}
        variant="default"
      />
    </div>
  );
}
