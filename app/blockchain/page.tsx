"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type IntegrityResult =
  | {
      status: "intact";
      totalRecords: number;
      message: string;
    }
  | {
      status: "broken";
      totalRecords: number;
      brokenAtSequence: number;
      details: string;
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export default function ChainIntegrity() {
  const [darkMode, setDarkMode] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<IntegrityResult | null>(null);

  /*
   * ==========================================================
   * BACKEND URL
   * ==========================================================
   *
   * Development:
   * http://127.0.0.1:8000
   *
   * When you deploy the FastAPI backend, change this to your
   * deployed backend URL.
   *
   * Example:
   * https://your-backend.onrender.com
   */

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const savedTheme = localStorage.getItem("transforma-theme");

    const isDark = savedTheme === "dark";

    setDarkMode(isDark);

    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;

      localStorage.setItem(
        "transforma-theme",
        next ? "dark" : "light"
      );

      document.documentElement.classList.toggle("dark", next);

      return next;
    });
  };

  const theme = darkMode
    ? {
        page: "bg-[#0b0d14] text-slate-100",
        nav: "border-slate-800/80 bg-[#10131d]/85",
        card: "border-slate-800 bg-[#121621]",
        soft: "bg-[#171b27]",
        input: "border-slate-700 bg-[#171b27] text-slate-200",
        muted: "text-slate-400",
        border: "border-slate-800",
        heading: "text-white",
        preview: "bg-[#111520]",
        footer: "bg-[#0d1018]",
      }
    : {
        page: "bg-[#f7f8fc] text-[#15182b]",
        nav: "border-slate-200/70 bg-white/75",
        card: "border-slate-200 bg-white",
        soft: "bg-slate-50",
        input: "border-slate-200 bg-slate-50 text-slate-700",
        muted: "text-slate-500",
        border: "border-slate-200",
        heading: "text-[#15182b]",
        preview: "bg-white",
        footer: "bg-white",
      };

  /*
   * ==========================================================
   * REAL BACKEND INTEGRATION
   * ==========================================================
   *
   * Your FastAPI backend already has:
   *
   * GET /verify-chain
   *
   * We call that endpoint here.
   */

  const checkChainIntegrity = async (): Promise<IntegrityResult> => {
    const response = await fetch(`${API_BASE_URL}/verify-chain`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = "Unable to verify chain integrity.";

      try {
        const errorData = await response.json();

        if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Keep default error message.
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    /*
     * Backend returns:
     *
     * {
     *   chain_intact: boolean,
     *   total_records: number,
     *   broken_at_sequence: number | null,
     *   message: string
     * }
     */

    if (data.chain_intact === true) {
      return {
        status: "intact",
        totalRecords: data.total_records ?? 0,
        message:
          data.message ||
          "All records verified. Chain is intact.",
      };
    }

    return {
      status: "broken",
      totalRecords: data.total_records ?? 0,
      brokenAtSequence: data.broken_at_sequence ?? 0,
      details:
        data.message ||
        "The transformation chain contains a broken sequence.",
      message:
        data.message ||
        "The transformation chain could not be verified.",
    };
  };

  const handleCheckIntegrity = async () => {
    if (isChecking) return;

    setIsChecking(true);
    setResult(null);

    try {
      const data = await checkChainIntegrity();

      setResult(data);

      setTimeout(() => {
        document
          .getElementById("integrity-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 100);
    } catch (error) {
      console.error(
        "Chain integrity check failed:",
        error
      );

      setResult({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to connect to the backend.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${theme.page}`}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className={`absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full blur-[130px] ${
            darkMode
              ? "bg-violet-700/20"
              : "bg-violet-300/30"
          }`}
        />

        <div
          className={`absolute right-[-10%] top-[15%] h-[500px] w-[500px] rounded-full blur-[130px] ${
            darkMode
              ? "bg-cyan-700/15"
              : "bg-cyan-200/30"
          }`}
        />

        <div
          className={`absolute bottom-[-10%] left-[30%] h-[500px] w-[500px] rounded-full blur-[130px] ${
            darkMode
              ? "bg-purple-700/15"
              : "bg-purple-200/20"
          }`}
        />

        <div
          className={`absolute inset-0 ${
            darkMode ? "opacity-20" : "opacity-40"
          }`}
          style={{
            backgroundImage: darkMode
              ? "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)"
              : "linear-gradient(rgba(80,70,150,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(80,70,150,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className={`fixed left-0 top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${theme.nav}`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-extrabold tracking-tight"
          >
            <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-violet-300/40">
              ✦
            </div>

            TransForma{" "}
            <span className="text-violet-600">AI</span>
          </Link>

          <div
            className={`hidden items-center gap-8 text-sm md:flex ${theme.muted}`}
          >
            <Link
              href="/"
              className="transition hover:text-violet-600"
            >
              Home
            </Link>

            <Link
              href="/transform"
              className="transition hover:text-violet-600"
            >
              Transform
            </Link>

            <Link
              href="/verify"
              className="transition hover:text-violet-600"
            >
              Verify
            </Link>

            <Link
              href="/blockchain"
              className="font-semibold text-violet-600"
            >
              Chain Integrity
            </Link>

            <a
              href="/#possibilities"
              className="transition hover:text-violet-600"
            >
              Possibilities
            </a>

            <a
              href="/#how"
              className="transition hover:text-violet-600"
            >
              How It Works
            </a>

            <a
              href="/#features"
              className="transition hover:text-violet-600"
            >
              Features
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className={`relative flex h-10 w-[72px] items-center rounded-full border p-1 transition ${
                darkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-200 bg-slate-100"
              }`}
            >
              <span
                className={`absolute grid h-8 w-8 place-items-center rounded-full shadow-sm transition-all duration-300 ${
                  darkMode
                    ? "translate-x-7 bg-slate-700"
                    : "translate-x-0 bg-white"
                }`}
              >
                {darkMode ? "🌙" : "☀️"}
              </span>

              <span className="ml-auto mr-1 text-[9px] font-bold text-slate-400">
                {darkMode ? "DARK" : "LIGHT"}
              </span>
            </button>

            <button
              className={`text-2xl sm:hidden ${theme.muted}`}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          CHAIN INTEGRITY PAGE
      ====================================================== */}

      <section className="relative pb-24 pt-36">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center px-5">

          {/* PAGE HEADER */}

          <div className="w-full max-w-[800px] text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-violet-600">
              <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />

              Blockchain Verification
            </div>

            <h1
              className={`text-5xl font-extrabold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-[64px] ${theme.heading}`}
            >
              Chain Integrity
              <span className="block bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Verification.
              </span>
            </h1>

            <p
              className={`mx-auto mt-7 max-w-[700px] text-lg leading-8 ${theme.muted}`}
            >
              Verify whether the complete transformation chain
              remains intact and detect any broken sequence in
              the recorded transformations.
            </p>
          </div>

          {/* =================================================
              CHECK CARD
          ================================================== */}

          <div
            className={`relative mt-14 w-full max-w-[560px] rounded-[23px] border p-8 shadow-2xl backdrop-blur-xl transition-colors duration-300 sm:p-10 ${theme.card}`}
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">

              <div className="grid h-16 w-16 place-items-center rounded-[17px] bg-gradient-to-br from-violet-100 to-indigo-100 text-3xl shadow-sm">
                🔗
              </div>

              <h2
                className={`mt-6 text-2xl font-extrabold tracking-tight ${theme.heading}`}
              >
                Chain Integrity Check
              </h2>

              <p
                className={`mt-3 max-w-[430px] text-sm leading-6 ${theme.muted}`}
              >
                Check all recorded transformations and determine
                whether the complete chain is intact.
              </p>

              {/* BUTTON */}

              <button
                type="button"
                onClick={handleCheckIntegrity}
                disabled={isChecking}
                className={`mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-violet-200 transition ${
                  isChecking
                    ? "cursor-not-allowed opacity-70"
                    : "hover:-translate-y-1"
                }`}
              >
                {isChecking ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Checking Chain...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Check Chain Integrity
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =================================================
              RESULT
          ================================================== */}

          {result && (
            <div
              id="integrity-result"
              className="mt-8 w-full max-w-[560px]"
            >

              {/* =================================================
                  BACKEND CONNECTION ERROR
              ================================================== */}

              {result.status === "error" && (
                <div className="rounded-[23px] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-red-50 p-8 text-center shadow-xl sm:p-10">

                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-[17px] bg-orange-100 text-2xl text-orange-600">
                    ⚠
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-orange-600">
                    Backend Connection Error
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-orange-800">
                    Could not check chain
                  </h2>

                  <p className="mx-auto mt-3 max-w-[430px] text-sm leading-6 text-slate-500">
                    {result.message}
                  </p>

                  <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4 text-left">
                    <p className="text-xs font-bold text-orange-700">
                      Backend URL
                    </p>

                    <p className="mt-1 break-all text-xs text-orange-600">
                      {API_BASE_URL}/verify-chain
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  SUCCESS STATE
              ================================================== */}

              {result.status === "intact" && (
                <div className="rounded-[23px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-8 text-center shadow-xl shadow-emerald-100/40 sm:p-10">

                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-[17px] bg-emerald-100 text-2xl text-emerald-600">
                    ✓
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Verification Successful
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-800">
                    Chain is intact
                  </h2>

                  <p className="mx-auto mt-3 max-w-[430px] text-sm leading-6 text-slate-500">
                    The complete transformation chain passed the
                    integrity check without any detected break.
                  </p>

                  <div className="mt-7 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Total Records
                    </p>

                    <p className="mt-1 text-3xl font-extrabold text-emerald-800">
                      {result.totalRecords}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      transformation records verified
                    </p>
                  </div>

                  <p className="mt-5 text-xs text-slate-500">
                    {result.message}
                  </p>
                </div>
              )}

              {/* =================================================
                  FAILED STATE
              ================================================== */}

              {result.status === "broken" && (
                <div className="rounded-[23px] border border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50 p-8 text-center shadow-xl shadow-red-100/40 sm:p-10">

                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-[17px] bg-red-100 text-2xl text-red-600">
                    ⚠
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-red-600">
                    Integrity Check Failed
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-red-700">
                    Chain verification failed
                  </h2>

                  <p className="mx-auto mt-3 max-w-[450px] text-sm leading-6 text-slate-500">
                    The transformation chain contains a broken
                    sequence and could not be verified as intact.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">

                    {/* TOTAL RECORDS */}

                    <div className="rounded-2xl border border-red-100 bg-white/90 p-5 text-left shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                        Total Records
                      </p>

                      <p className="mt-1 text-3xl font-extrabold text-red-700">
                        {result.totalRecords}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        records checked
                      </p>
                    </div>

                    {/* BROKEN SEQUENCE */}

                    <div className="rounded-2xl border border-red-100 bg-white/90 p-5 text-left shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                        Broken at Sequence
                      </p>

                      <p className="mt-1 text-3xl font-extrabold text-red-700">
                        {result.brokenAtSequence}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        detected break position
                      </p>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/70 p-5 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                      Details
                    </p>

                    <p className="mt-2 text-sm font-semibold text-red-800">
                      {result.details}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </section>
    </main>
  );
}
