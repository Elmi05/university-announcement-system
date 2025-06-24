import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Divider,
  Avatar,
  Stack,
  Fade,
  Grid,
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  AdminPanelSettings, 
  VpnKey,
  Business,
  Dashboard,
  Security,
  Login as LoginIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'

import { useAuth } from '../contexts/AuthContext'

interface LoginFormData {
  email: string
  password: string
}

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

const PlatformAdminLogin: React.FC = () => {
  const { signIn, user, userType } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  })

  // Redirect if already logged in as platform admin
  if (user && userType === 'platform_admin') {
    return <Navigate to="/platform/dashboard" replace />
  }

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    try {
      await signIn(data.email, data.password, 'platform_admin')
      toast.success('Successfully logged in!')
      navigate('/platform/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to log in')
      toast.error('Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleQuickLogin = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
  }

  const credentials = [
    { 
      email: 'superadmin@platform.com', 
      password: 'admin123', 
      role: 'Super Admin',
      description: 'Full platform access'
    },
    { 
      email: 'admin@platform.com', 
      password: 'password123', 
      role: 'Platform Admin',
      description: 'University management'
    },
    { 
      email: 'admin@harvard.edu', 
      password: 'password123', 
      role: 'Harvard Admin',
      description: 'Harvard University'
    },
    { 
      email: 'admin@stanford.edu', 
      password: 'password123', 
      role: 'Stanford Admin',
      description: 'Stanford University'
    },
  ]



  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Side - Login Form */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={24}
                sx={{
                  p: 5,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {/* Header */}
                <Box textAlign="center" mb={4}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 2,
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    }}
                  >
                    <AdminPanelSettings sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                    Platform Admin
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Multi-Tenant Announcement System
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    margin="normal"
                    variant="outlined"
                    placeholder="admin@platform.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    margin="normal"
                    variant="outlined"
                    placeholder="password123"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register('password')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      borderRadius: 2,
                      py: 1.5,
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                      },
                    }}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Right Side - Credentials & Info */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                <Box mb={3}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🚀 Demo Credentials
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Click on any credential below to auto-fill the login form
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {credentials.map((cred, index) => (
                    <Card
                      key={index}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleQuickLogin(cred.email, cred.password)}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                            }}
                          >
                            {cred.role === 'Super Admin' ? <AdminPanelSettings /> : 
                             cred.role.includes('Admin') ? <Business /> : <Dashboard />}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold" color="white">
                              {cred.role}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                              {cred.email}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {cred.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ✨ Features
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      🏢 Multi-tenant university management
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      👥 University user management
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      📊 Real-time analytics dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      🔒 Role-based access control
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  )
}

export default PlatformAdminLogin 