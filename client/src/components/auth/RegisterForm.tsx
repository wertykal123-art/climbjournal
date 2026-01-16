import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { AxiosError } from 'axios'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setIsLoading(true)

    try {
      await register({ email, username, displayName, password })
      showToast('success', 'Account created successfully!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>
      if (axiosError.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(axiosError.response.data.errors).forEach(([key, messages]) => {
          fieldErrors[key] = messages[0]
        })
        setErrors(fieldErrors)
      } else {
        showToast('error', axiosError.response?.data?.message || 'Registration failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardBody>
        <h2 className="text-2xl font-bold text-rock-900 mb-6 text-center">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
          />
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            required
            autoComplete="username"
            placeholder="No spaces, letters, numbers, underscores"
          />
          <Input
            label="Display Name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={errors.displayName}
            required
            placeholder="Your name as shown to others"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="new-password"
            placeholder="Min 8 chars, uppercase, lowercase, number"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-rock-600">
          Already have an account?{' '}
          <Link to="/login" className="text-carabiner hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
