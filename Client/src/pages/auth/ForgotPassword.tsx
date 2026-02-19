import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const emailSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });

  const handleForgot = async (data: any) => {
    setLoading(true);
    try {
      await api.forgotPassword(data.email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (data: any) => {
    setLoading(true);
    try {
      await api.resetPassword(resetToken!, data.password);
      setResetDone(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader>
          <CardTitle>{resetToken ? 'Set New Password' : 'Forgot Password'}</CardTitle>
          <CardDescription>
            {resetToken ? 'Enter your new password below.' : 'Enter your email to receive a reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Reset password form (token in URL) */}
          {resetToken && !resetDone && (
            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input type="password" placeholder="Min 8 characters" {...resetForm.register('password')} />
                {resetForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{resetForm.formState.errors.password.message as string}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Re-enter password" {...resetForm.register('confirm')} />
                {resetForm.formState.errors.confirm && (
                  <p className="text-xs text-red-500">{resetForm.formState.errors.confirm.message as string}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {resetDone && (
            <div className="text-center space-y-4">
              <p className="text-green-600">Password reset successfully!</p>
              <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
            </div>
          )}

          {/* Forgot password form (no token) */}
          {!resetToken && !sent && (
            <form onSubmit={emailForm.handleSubmit(handleForgot)} className="space-y-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" placeholder="yourname@nith.ac.in" {...emailForm.register('email')} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full">Back to Login</Button>
              </Link>
            </form>
          )}

          {sent && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                If that email is registered, a reset link has been sent. Check your inbox.
              </p>
              <Link to="/login"><Button variant="outline" className="w-full">Back to Login</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
