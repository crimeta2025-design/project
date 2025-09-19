import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const API_URL = 'https://project1-er3b.onrender.com/auth/forgot-password';
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to send reset link.');
            setMessage(data.msg);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-center mb-4 text-gray-600">Enter your email address and we will send you a link to reset your password.</p>
                    {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                    {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email Address"
                        required
                        className="w-full px-4 py-2 border rounded-lg mb-4"
                    />
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="text-center mt-4">
                    <Link to="/login" className="text-blue-600">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;