import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OtpPage = () => {
    const [otp, setOtp] = useState('');
    const [secret, setSecret] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpGenerated, setOtpGenerated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Generate OTP when component mounts
        generateOtp();
    }, []);

    const generateOtp = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/otp/generate');
            setSecret(response.data.secret);
            setOtpGenerated(true);
            // In development, you might want to show the OTP
            if (process.env.NODE_ENV === 'development') {
                setMessage(`OTP generated: ${response.data.otp}`);
            } else {
                setMessage('OTP has been sent to your email/phone');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error generating OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/otp/verify', { otp, secret });
            if (response.data.verified) {
                setMessage('OTP verified successfully. Redirecting...');
                setTimeout(() => {
                    navigate('/dashboard'); // Redirect to dashboard or homepage
                }, 1500);
            } else {
                setMessage('Invalid OTP. Please try again.');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error verifying OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-page" style={{ 
            textAlign: 'center', 
            marginTop: '50px', 
            maxWidth: '400px', 
            margin: '50px auto', 
            padding: '20px', 
            boxShadow: '0 0 10px rgba(0,0,0,0.1)', 
            borderRadius: '8px' 
        }}>
            <h1>Two-Factor Authentication</h1>
            <p>Enter the OTP code to verify your identity</p>
            
            {otpGenerated ? (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={{
                                padding: '10px',
                                width: '100%',
                                fontSize: '16px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            ) : (
                <button 
                    onClick={generateOtp}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? 'Generating...' : 'Generate OTP'}
                </button>
            )}
            
            {message && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default OtpPage;
