import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Phone, Shield, Loader2 } from 'lucide-react'

export default function AuthForm() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signInWithOTP, verifyOTP } = useAuth()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signInWithOTP(mobile)
      setStep('otp')
    } catch (error: any) {
      if (error.message.includes('configure your Supabase credentials')) {
        setError('Please set up your Supabase credentials. Check the console for instructions.')
        console.error('🔧 Setup Required: Please configure your Supabase credentials in the .env file')
        console.log('1. Copy .env.example to .env')
        console.log('2. Replace the placeholder values with your actual Supabase URL and anon key')
        console.log('3. Restart the development server')
      } else {
        setError(error.message || 'Failed to send OTP. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await verifyOTP(mobile, otp)
    } catch (error: any) {
      if (error.message.includes('configure your Supabase credentials')) {
        setError('Please set up your Supabase credentials. Check the console for instructions.')
      } else {
        setError(error.message || 'Invalid OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatMobileNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Add +971 prefix if not present
    if (digits.length > 0 && !digits.startsWith('971')) {
      return '+971' + digits
    } else if (digits.startsWith('971')) {
      return '+' + digits
    }
    return value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ExpiryTracker</h1>
          <p className="text-gray-600">Track your important document expiry dates</p>
        </div>

        <div className="card">
          {step === 'mobile' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(formatMobileNumber(e.target.value))}
                    placeholder="+971 50 123 4567"
                    className="input-field pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you a verification code via SMS
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !mobile}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                <span>{loading ? 'Sending...' : 'Send OTP'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="input-field text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Code sent to {mobile}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('mobile')
                    setOtp('')
                    setError('')
                  }}
                  className="btn-secondary w-full"
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}