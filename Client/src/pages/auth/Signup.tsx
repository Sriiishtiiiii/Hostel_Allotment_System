import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  roll_no: z.string().min(3, 'Enter your roll number'),
  email: z.string().email().refine((e) => e.endsWith('@nith.ac.in'), {
    message: 'Only @nith.ac.in emails are allowed',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  department: z.string().min(1, 'Select your department'),
  academic_year: z.string().min(1, 'Enter admission year'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const DEPARTMENTS = [
  'Computer Science', 'Electronics', 'Electrical', 'Mechanical',
  'Civil', 'Chemical', 'Architecture', 'Physics', 'Mathematics', 'Other',
];

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.signup({ ...data, academic_year: parseInt(data.academic_year) });
      toast.success('Account created! Please check your email to verify.');
      navigate('/verify-email', { state: { email: data.email } });
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">NIT Hamirpur</h1>
          <p className="text-blue-300 mt-1">Hostel Allotment System</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Register with your @nith.ac.in email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input placeholder="Arjun Kumar" {...register('name')} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Roll Number</Label>
                  <Input placeholder="21CS001" {...register('roll_no')} />
                  {errors.roll_no && <p className="text-xs text-red-500">{errors.roll_no.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label>College Email</Label>
                <Input type="email" placeholder="yourname@nith.ac.in" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Password</Label>
                <Input type="password" placeholder="Min 8 characters" {...register('password')} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Select onValueChange={(v) => setValue('department', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Admission Year</Label>
                  <Input type="number" placeholder="2021" {...register('academic_year')} />
                  {errors.academic_year && <p className="text-xs text-red-500">{errors.academic_year.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <Select onValueChange={(v: any) => setValue('gender', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Phone (optional)</Label>
                  <Input placeholder="9876543210" {...register('phone')} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
