import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Fade,
  CircularProgress,
} from '@mui/material'
import {
  School,
  Person,
  Email,
  Lock,
  Login,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const UniversityAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  // Fetch all university users for login
  const { data: universityUsers = [], isLoading: usersLoading, error: queryError } = useQuery({
    queryKey: ['university-users-login'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('university_users')
        .select(`
          *,
          university:universities(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching university users:', error)
        throw error
      }
      return data || []
    },
    retry: 3,
    refetchOnWindowFocus: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password, 'university_user')
      navigate('/university/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail)
    setPassword('password123')
  }

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
            {/* Login Form */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Box textAlign="center" mb={4}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    }}
                  >
                    <School sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    University Portal
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to access your university announcements
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {queryError && (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    Error loading user data. Please refresh the page.
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Login />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                      },
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>

                <Box mt={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    University students and staff only
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Demo Credentials */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  🎓 University Users
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                  Click on any user below to auto-fill login credentials
                </Typography>

                {usersLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress color="inherit" />
                  </Box>
                ) : universityUsers && universityUsers.length > 0 ? (
                  <Stack spacing={2}>
                    {universityUsers.map((user) => (
                      <Card
                        key={user.id}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.25)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => handleQuickLogin(user.email)}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                              <Avatar
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                                  color: 'white',
                                  mr: 2,
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                <Person />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold" color="white">
                                  {user.first_name} {user.last_name}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                  {user.email}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {user.university?.name} • {user.department}
                                </Typography>
                              </Box>
                            </Box>
                            <Box textAlign="right">
                              <Chip
                                label={user.year_level}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'white',
                                  mb: 0.5,
                                }}
                              />
                              <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                                ID: {user.student_id}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      No university users found. Please contact your administrator.
                    </Typography>
                  </Box>
                )}

                <Box mt={4} p={3} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    ✨ University Users
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    • All users have password: <strong>password123</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    • Real university users created by super admin
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    • Click any user card to auto-fill credentials
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  )
}

export default UniversityAdminLogin 