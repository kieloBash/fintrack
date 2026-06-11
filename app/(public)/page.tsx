'use client'
import { UserService } from '@/services/user.service';
import { useClerk, useSignIn, useSignUp } from '@clerk/nextjs';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-[#1D3D8F] rounded-[22px] flex items-center justify-center shadow-lg mb-4 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/10" />
        <span className="text-2xl font-extrabold text-white relative z-10 tracking-tight">FT</span>
      </div>
      <h1 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">FinTrack</h1>
      <p className="text-sm text-[#6C6C70] mt-1 font-medium">Your money, always in view</p>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
  error?: string;
}

function InputField({ label, type = 'text', placeholder, value, onChange, autoComplete, rightSlot, error }: InputFieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#3A3A3C] uppercase tracking-wide mb-1.5 block">{label}</label>
      <div className={`flex items-center bg-[#F2F2F7] rounded-2xl px-4 border-2 transition-colors ${error ? 'border-[#FF3B30]' : 'border-transparent focus-within:border-[#1D3D8F]'
        }`}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="flex-1 py-3.5 text-sm font-medium text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
        />
        {rightSlot}
      </div>
      {error && <p className="text-[11px] text-[#FF3B30] mt-1 px-1">{error}</p>}
    </div>
  );
}

function PasswordField({ label, placeholder, value, onChange, autoComplete, error }: Omit<InputFieldProps, 'type' | 'rightSlot'>) {
  const [visible, setVisible] = useState(false);
  return (
    <InputField
      label={label}
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      error={error}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="ml-2 text-[#AEAEB2] hover:text-[#6C6C70] transition-colors"
        >
          {visible ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
        </button>
      }
    />
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-[#E5E5EA]" />
      <span className="text-xs font-medium text-[#AEAEB2]">or</span>
      <div className="flex-1 h-px bg-[#E5E5EA]" />
    </div>
  );
}

// ─── Login view ─────────────────────────────────────────────────────────────

interface LoginViewProps {
  onGoRegister: () => void;
}

function LoginView({ onGoRegister }: LoginViewProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const { signIn, errors: clerkErrors, fetchStatus } = useSignIn()
  const { isSignedIn } = useClerk()
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/home")
    }
  }, [isSignedIn])

  function validate() {
    const e: typeof errors = {};
    if (!identifier.trim()) e.identifier = 'Email or username is required.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          // Handle pending session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          console.log(session?.currentTask)
          return
        }

        const url = decorateUrl('/home')
        if (url.startsWith('http')) {
          window.location.href = url
        } else {
          router.push(url)
        }
      },
    })
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);

    const { error: createError } = await signIn.password({
      identifier: identifier,
      password,
    })

    if (createError) {
      console.error(JSON.stringify(createError, null, 2))
      return
    }

    if (signIn.status === "complete") {
      finalizeSignIn()
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#1C1C1E]">Welcome back</h2>
        <p className="text-sm text-[#6C6C70] mt-1">Sign in to your account</p>
      </div>

      <InputField
        label="Email or username"
        placeholder="you@example.com"
        value={identifier}
        onChange={setIdentifier}
        autoComplete="email"
        error={errors.identifier}
      />

      <PasswordField
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        error={errors.password}
      />

      <div className="text-right -mt-1">
        <button className="text-xs font-semibold text-[#1D3D8F] hover:text-[#163074] transition-colors">
          Forgot password?
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#1D3D8F] text-white rounded-2xl py-4 text-sm font-bold hover:bg-[#163074] active:bg-[#122960] transition-all disabled:opacity-60 mt-2 shadow-sm"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>Sign In <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>
        )}
      </button>

      <p className="text-center text-sm text-[#6C6C70] pt-1">
        No account?{' '}
        <button onClick={onGoRegister} className="font-semibold text-[#1D3D8F] hover:text-[#163074] transition-colors">
          Create one
        </button>
      </p>
    </div>
  );
}

// ─── Register view ───────────────────────────────────────────────────────────

interface RegisterViewProps {
  onGoLogin: () => void;
}

const steps = ['Account', 'Password', 'Done'];

function RegisterView({ onGoLogin }: RegisterViewProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { signUp } = useSignUp()
  const router = useRouter();

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#FF3B30', '#F97316', '#F59E0B', '#34D399'][strength];

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== confirm) e.confirm = "Passwords don't match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleNext() {
    if (step === 0 && validateStep0()) { setErrors({}); setStep(1); }
    else if (step === 1 && validateStep1()) {
      setErrors({});
      setLoading(true);

      const { error } = await signUp.password({
        emailAddress: email,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1],
        username,
        password,
      })

      console.log({ email, name, username, password })
      console.log("signin up")
      console.log(error)

      if (error) {
        setLoading(false);
        console.log(error);
        return;
      }
      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: async ({ session, decorateUrl }) => {
            // Handle session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            if (session?.currentTask) {
              console.log(session?.currentTask)
              return
            }
            setLoading(false);
            setStep(2);
          },
        })
        await UserService.createUserAfterSignIn()
      } else {
        // Check why the status is not complete
        setLoading(false);
        console.log({
          status: signUp.status,
          missingFields: signUp.missingFields,
          unverifiedFields: signUp.unverifiedFields,
          requiredFields: signUp.requiredFields,
        })
        console.error('Sign-up attempt not complete. Status:', signUp.status)
      }

    }
  }

  return (
    <div>
      {/* Step header */}
      {step < 2 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            {step > 0 && (
              <button
                onClick={() => { setStep((s) => s - 1); setErrors({}); }}
                className="w-8 h-8 rounded-xl bg-[#F2F2F7] flex items-center justify-center hover:bg-[#E5E5EA] transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4 text-[#6C6C70]" strokeWidth={2} />
              </button>
            )}
            <div className="flex-1 flex gap-1.5">
              {steps.slice(0, 2).map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: i <= step ? '#1D3D8F' : '#E5E5EA' }}
                />
              ))}
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#1C1C1E]">
            {step === 0 ? 'Create your account' : 'Set a password'}
          </h2>
          <p className="text-sm text-[#6C6C70] mt-1">
            {step === 0 ? 'Step 1 of 2 — Basic info' : 'Step 2 of 2 — Keep it secure'}
          </p>
        </div>
      )}

      {/* Step 0 — Account info */}
      {step === 0 && (
        <div className="space-y-4">
          <InputField
            label="Full name"
            placeholder="Kielo Mercado"
            value={name}
            onChange={setName}
            autoComplete="name"
            error={errors.name}
          />
          <InputField
            label="Username"
            placeholder="kieloBash"
            value={username}
            onChange={setUsername}
            autoComplete="username"
            error={errors.username}
          />
          <InputField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            error={errors.email}
          />

          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 bg-[#1D3D8F] text-white rounded-2xl py-4 text-sm font-bold hover:bg-[#163074] transition-all shadow-sm mt-2"
          >
            Continue <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <p className="text-center text-sm text-[#6C6C70]">
            Already have an account?{' '}
            <button onClick={onGoLogin} className="font-semibold text-[#1D3D8F] hover:text-[#163074] transition-colors">
              Sign in
            </button>
          </p>
        </div>
      )}

      {/* Step 1 — Password */}
      {step === 1 && (
        <div className="space-y-4">
          <PasswordField
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            error={errors.password}
          />

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="-mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: i <= strength ? strengthColor : '#E5E5EA' }}
                  />
                ))}
              </div>
              <p className="text-[11px] font-semibold px-0.5" style={{ color: strengthColor }}>
                {strengthLabel}
              </p>
            </div>
          )}

          <PasswordField
            label="Confirm password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            error={errors.confirm}
          />

          {/* Requirements */}
          <div className="bg-[#F2F2F7] rounded-2xl p-4 space-y-2">
            {[
              { label: 'At least 8 characters', met: password.length >= 8 },
              { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
              { label: 'One number', met: /[0-9]/.test(password) },
            ].map((req) => (
              <div key={req.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-[#34D399]' : 'bg-[#D1D1D6]'
                  }`}>
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
                <span className={`text-xs font-medium transition-colors ${req.met ? 'text-[#3A3A3C]' : 'text-[#AEAEB2]'}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1D3D8F] text-white rounded-2xl py-4 text-sm font-bold hover:bg-[#163074] transition-all disabled:opacity-60 shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create Account <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>
            )}
          </button>
        </div>
      )}

      {/* Step 2 — Success */}
      {step === 2 && (
        <div className="flex flex-col items-center text-center py-6 space-y-5">
          <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center">
            <Check className="w-9 h-9 text-[#059669]" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1E]">You're all set!</h2>
            <p className="text-sm text-[#6C6C70] mt-1.5 leading-relaxed">
              Welcome to FinTrack, <span className="font-semibold text-[#1C1C1E]">{name || 'there'}</span>.<br />
              Your account has been created.
            </p>
          </div>
          <button
            onClick={() => {
              router.replace("/home")
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#1D3D8F] text-white rounded-2xl py-4 text-sm font-bold hover:bg-[#163074] transition-all shadow-sm"
          >
            Go to Login <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── AuthPage shell ──────────────────────────────────────────────────────────

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const router = useRouter();

  async function onAuth() {
    router.push('/home');
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
      {/* Top hero area */}
      <div className="flex-1 flex flex-col items-center justify-end pb-10 pt-16 px-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#1D3D8F]/[0.06]" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[260px] h-[260px] rounded-full bg-[#1D3D8F]/[0.05]" />

        <BrandMark />

        {/* Pill tag */}
        <div className="mt-6 flex items-center gap-2 bg-white border border-[#E5E5EA] rounded-full px-4 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#34D399]" />
          <span className="text-xs font-semibold text-[#3A3A3C]">Auto-tracks your spending from email</span>
        </div>
      </div>

      {/* Form sheet */}
      <div className="bg-white rounded-t-[36px] shadow-[0_-8px_40px_rgba(0,0,0,0.08)] px-6 pt-8 pb-10 border-t border-[#E5E5EA]">
        {view === 'login' ? (
          <LoginView onGoRegister={() => setView('register')} />
        ) : (
          <RegisterView onGoLogin={() => setView('login')} />
        )}
        <div id="clerk-captcha" />
      </div>
    </div>
  );
}
