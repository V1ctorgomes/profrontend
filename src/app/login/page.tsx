import { LoginBanner } from '@/components/auth/login-banner';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-brand-canvas font-sans selection:bg-brand-100 selection:text-brand-900">
      <LoginBanner />
      <LoginForm />
    </div>
  );
}
