import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/shop');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-nexora-light-primary dark:bg-nexora-dark-card items-center justify-center p-16">
        <div>
          <h1 className="font-display text-4xl font-bold text-white dark:text-nexora-dark-primary mb-4">Join NEXORA</h1>
          <p className="text-gray-400 text-lg max-w-sm">Create an account and start your premium shopping journey.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl font-bold lg:hidden mb-8 block">NEXORA</Link>
          <h2 className="font-display text-2xl font-bold mb-2">Create account</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Fill in your details to get started</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {['name', 'email', 'password', 'confirm'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2 capitalize">
                  {field === 'confirm' ? 'Confirm Password' : field}
                </label>
                <input
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-nexora-light-accent dark:text-nexora-dark-accent font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
