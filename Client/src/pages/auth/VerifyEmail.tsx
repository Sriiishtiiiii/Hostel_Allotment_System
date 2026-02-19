import { useEffect, useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const emailFromState = (location.state as any)?.email;

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;

    setStatus('verifying');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  const handleResend = async () => {
    if (!emailFromState) return;
    try {
      await api.resendVerification(emailFromState);
      setResent(true);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  // Waiting for email (no token in URL)
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0">
          <CardHeader>
            <div className="text-5xl mb-2">📧</div>
            <CardTitle>Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We sent a verification link to{' '}
              <strong>{emailFromState || 'your email'}</strong>.
              <br />Click the link to activate your account.
            </p>
            {emailFromState && !resent && (
              <Button variant="outline" onClick={handleResend} className="w-full">
                Resend verification email
              </Button>
            )}
            {resent && <p className="text-green-600 text-sm">Verification email resent!</p>}
            <Link to="/login">
              <Button variant="ghost" className="w-full">Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl border-0">
        <CardHeader>
          <div className="text-5xl mb-2">
            {status === 'verifying' ? '⏳' : status === 'success' ? '✅' : '❌'}
          </div>
          <CardTitle>
            {status === 'verifying' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {status === 'success' && (
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          )}
          {status === 'error' && (
            <Link to="/login">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
