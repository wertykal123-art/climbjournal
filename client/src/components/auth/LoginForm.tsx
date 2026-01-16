import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { AxiosError } from 'axios'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await login({ email, password })
      showToast('success', 'Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>
      if (axiosError.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(axiosError.response.data.errors).forEach(([key, messages]) => {
          fieldErrors[key] = messages[0]
        })
        setErrors(fieldErrors)
      } else {
        showToast('error', axiosError.response?.data?.message || 'Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardBody>
        <h2 className="text-2xl font-bold text-rock-900 mb-6 text-center">
          Welcome Back
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
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-rock-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-carabiner hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
