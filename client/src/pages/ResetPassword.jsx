import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { token } = useParams(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const API_URL = `https://project1-er3b.onrender.com/auth/reset-password/${token}`;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to reset password.');
            setMessage(data.msg);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
                <form onSubmit={handleSubmit}>
                    {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                    {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                        required
                        className="w-full px-4 py-2 border rounded-lg mb-4"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        required
                        className="w-full px-4 py-2 border rounded-lg mb-4"
                    />
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default ResetPassword;