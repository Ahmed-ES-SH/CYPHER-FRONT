"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useRegister,
} from "@/src/modules/user";
import type { CreateUserDto } from "@/src/modules/user";
import {
  FiUser,
  FiMail,
  FiLock,
  FiImage,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiCheck,
  FiXCircle,
} from "react-icons/fi";

/* ── Password strength helpers ── */

interface StrengthResult {
  score: number;   // 0–4
  label: string;
  color: string;
  bg: string;
}

const REQUIRED = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

function evaluateStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", color: "", bg: "" };
  const met = REQUIRED.filter((r) => r.test(password)).length;
  if (met <= 1) return { score: 1, label: "Weak", color: "text-red-500", bg: "bg-red-500" };
  if (met === 2) return { score: 2, label: "Fair", color: "text-orange-500", bg: "bg-orange-500" };
  if (met === 3) return { score: 3, label: "Good", color: "text-yellow-500", bg: "bg-yellow-500" };
  return { score: 4, label: "Strong", color: "text-green-500", bg: "bg-green-500" };
}

/* ── Component ── */

export default function UserCreateForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const formRef = useRef<HTMLFormElement>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Save-options
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brokenAvatar, setBrokenAvatar] = useState(false);

  const passwordStrength = evaluateStrength(password);

  /* ── Validation ── */

  const validateField = useCallback(
    (field: string, value: string): string | null => {
      switch (field) {
        case "name":
          return !value.trim()
            ? "Name is required"
            : value.trim().length < 2
              ? "Name must be at least 2 characters"
              : null;
        case "email":
          return !value.trim()
            ? "Email is required"
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
              ? "Enter a valid email address"
              : null;
        case "confirmEmail":
          return !value.trim()
            ? "Please confirm your email"
            : value.trim() !== email.trim()
              ? "Email addresses do not match"
              : null;
        case "password":
          if (!value) return "Password is required";
          if (value.length < 6) return "Password must be at least 6 characters";
          return null;
        case "avatarUrl":
          return value && !/^https?:\/\/.+/.test(value)
            ? "Enter a valid URL starting with http:// or https://"
            : null;
        default:
          return null;
      }
    },
    [email]
  );

  const setFieldError = (field: string, msg: string | null) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const handleBlur = (field: string, value: string) => {
    setFieldError(field, validateField(field, value));
  };

  /* ── Reset ── */

  const resetForm = () => {
    setName("");
    setEmail("");
    setConfirmEmail("");
    setPassword("");
    setShowPassword(false);
    setAvatarUrl("");
    setBrokenAvatar(false);
    setErrors({});
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  };

  /* ── Submit ── */

  const performSubmit = async () => {
    setErrors({});

    // Validate all fields
    const fieldErrors: Record<string, string> = {};
    const checks: [string, string][] = [
      ["name", name],
      ["email", email],
      ["confirmEmail", confirmEmail],
      ["password", password],
    ];
    if (avatarUrl.trim()) checks.push(["avatarUrl", avatarUrl]);

    for (const [field, value] of checks) {
      const msg = validateField(field, value);
      if (msg) fieldErrors[field] = msg;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const dto: CreateUserDto = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      avatar: avatarUrl.trim() || undefined,
    };

    try {
      await registerMutation.mutateAsync(dto);
      toast.success("User created successfully");

      if (saveAndAddAnother) {
        resetForm();
      } else {
        router.push("/dashboard/users");
      }
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        const map: Record<string, string> = {};
        err.errors.forEach((it: any) => {
          if (it.field && it.message) map[it.field] = it.message;
        });
        setErrors(map);
      }
      toast.error(err?.message || "Failed to create user");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSubmit();
  };

  /* ── Keyboard shortcut ── */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      performSubmit();
    }
  };

  const loading = registerMutation.isPending;

  /* ── Shared input styles ── */

  const inputClass = (field: string) =>
    [
      "w-full border rounded-md pl-10 pr-3 py-2 text-sm text-text-primary",
      "focus:outline-none transition-shadow bg-surface",
      errors[field]
        ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        : "border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary",
    ].join(" ");

  const inputInvalid = (field: string) => !!errors[field];

  /* ── Render ── */

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="max-w-2xl space-y-6"
    >
      {/* ── Personal Information ── */}
      <section className="bg-surface-elevated rounded-lg border border-border-subtle p-6">
        <div className="border-b border-border-subtle pb-4 mb-6">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <FiUser className="text-icon-color text-[20px]" />
            Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="field-name"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Full Name *
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-icon-color size-4 pointer-events-none" />
              <input
                id="field-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name", name)}
                placeholder="e.g. John Doe"
                autoFocus
                aria-invalid={inputInvalid("name")}
                aria-describedby={errors.name ? "err-name" : undefined}
                className={inputClass("name")}
              />
            </div>
            {errors.name && (
              <p id="err-name" className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <FiXCircle className="size-3 shrink-0" aria-hidden="true" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="field-email"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Email Address *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-icon-color size-4 pointer-events-none" />
              <input
                id="field-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email", email)}
                placeholder="e.g. john@example.com"
                type="email"
                autoComplete="email"
                aria-invalid={inputInvalid("email")}
                aria-describedby={errors.email ? "err-email" : undefined}
                className={inputClass("email")}
              />
            </div>
            {errors.email && (
              <p id="err-email" className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <FiXCircle className="size-3 shrink-0" aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Confirm Email */}
          <div>
            <label
              htmlFor="field-confirm-email"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Confirm Email Address *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-icon-color size-4 pointer-events-none" />
              <input
                id="field-confirm-email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                onBlur={() =>
                  setFieldError("confirmEmail", validateField("confirmEmail", confirmEmail))
                }
                placeholder="Re-enter email address"
                type="email"
                autoComplete="off"
                aria-invalid={inputInvalid("confirmEmail")}
                aria-describedby={errors.confirmEmail ? "err-confirm-email" : undefined}
                className={inputClass("confirmEmail")}
              />
            </div>
            {errors.confirmEmail && (
              <p id="err-confirm-email" className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <FiXCircle className="size-3 shrink-0" aria-hidden="true" />
                {errors.confirmEmail}
              </p>
            )}
            {!errors.confirmEmail && confirmEmail && email && confirmEmail === email && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <FiCheck className="size-3 shrink-0" aria-hidden="true" />
                Emails match
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="field-password"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Password *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-icon-color size-4 pointer-events-none" />
              <input
                id="field-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password", password)}
                placeholder="Minimum 6 characters"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={inputInvalid("password")}
                aria-describedby={errors.password ? "err-password" : undefined}
                className={`${inputClass("password")} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-color hover:text-text-secondary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="size-4" />
                ) : (
                  <FiEye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="err-password" className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <FiXCircle className="size-3 shrink-0" aria-hidden="true" />
                {errors.password}
              </p>
            )}

            {/* Password strength bar */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.bg}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
                {passwordStrength.label && (
                  <p className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>
                )}

                {/* Requirements checklist */}
                <ul className="space-y-1">
                  {REQUIRED.map((r) => {
                    const met = r.test(password);
                    return (
                      <li
                        key={r.label}
                        className={`text-xs flex items-center gap-1.5 ${
                          met ? "text-green-600" : "text-text-muted"
                        }`}
                      >
                        {met ? (
                          <FiCheck className="size-3 shrink-0" />
                        ) : (
                          <span className="size-3 shrink-0 flex items-center justify-center text-[10px]">
                            •
                          </span>
                        )}
                        {r.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Avatar URL */}
          <div className="md:col-span-2">
            <label
              htmlFor="field-avatar"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Avatar URL <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-icon-color size-4 pointer-events-none" />
              <input
                id="field-avatar"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setBrokenAvatar(false);
                }}
                onBlur={() => handleBlur("avatarUrl", avatarUrl)}
                placeholder="https://example.com/avatar.jpg"
                aria-invalid={inputInvalid("avatarUrl")}
                aria-describedby={errors.avatarUrl ? "err-avatar" : undefined}
                className={inputClass("avatarUrl")}
              />
            </div>
            {errors.avatarUrl && (
              <p id="err-avatar" className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <FiXCircle className="size-3 shrink-0" aria-hidden="true" />
                {errors.avatarUrl}
              </p>
            )}
            {avatarUrl && !brokenAvatar && (
              <div className="mt-4 flex items-center gap-4">
                <div className="size-16 rounded-full overflow-hidden border-2 border-border-subtle bg-surface shadow-sm shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="size-full object-cover"
                    onError={() => setBrokenAvatar(true)}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary">Avatar preview</span>
                  <span className="text-xs text-text-muted mt-0.5">{avatarUrl.length > 50 ? avatarUrl.slice(0, 50) + "..." : avatarUrl}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Form Actions ── */}
      <div className="border-t border-border-subtle pt-5 mt-6 flex flex-wrap items-center justify-end gap-3">
        <label className="mr-auto flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAndAddAnother}
            onChange={(e) => setSaveAndAddAnother(e.target.checked)}
            className="rounded border-border-subtle text-primary focus:ring-primary size-4"
          />
          Save and add another
        </label>

        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] text-text-muted bg-surface rounded border border-border-subtle">
          <span className="text-xs leading-none">⌘</span>Enter
        </kbd>

        <button
          type="button"
          onClick={() => router.push("/dashboard/users")}
          disabled={loading}
          className="px-5 py-2 rounded-md border border-border-subtle bg-surface-elevated text-text-primary text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-dark-navy transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <FiLoader className="size-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            "Create User"
          )}
        </button>
      </div>
    </form>
  );
}
