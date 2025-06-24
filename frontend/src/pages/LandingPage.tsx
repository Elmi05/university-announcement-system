import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
} from '@mui/material'
import { 
  AdminPanelSettings, 
  School,
  ArrowForward
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

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
      <Container maxWidth="md">
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            color="white" 
            gutterBottom
          >
            🏢 Multi-Tenant Announcement System
          </Typography>
          <Typography 
            variant="h5" 
            color="rgba(255,255,255,0.9)" 
            sx={{ mb: 4 }}
          >
            Choose your login portal to continue
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Platform Admin */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                },
              }}
              onClick={() => navigate('/platform/login')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    bgcolor: 'primary.main',
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 40 }} />
                </Avatar>
                
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Platform Admin
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                  Manage universities, users, analytics, and platform settings. 
                  Full administrative access to the entire system.
                </Typography>
                
                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ University Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✅ User Administration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Platform Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✅ System Settings
                  </Typography>
                </Stack>
                
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Admin Login
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* University Users */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                },
              }}
              onClick={() => navigate('/university/login')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    bgcolor: 'secondary.main',
                  }}
                >
                  <School sx={{ fontSize: 40 }} />
                </Avatar>
                
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  University Portal
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                  Access your university's announcements, view your profile, 
                  and stay connected with campus updates.
                </Typography>
                
                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ University Announcements
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Personal Dashboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Profile Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Campus Updates
                  </Typography>
                </Stack>
                
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Student Login
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={6}>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            Need help? Contact your system administrator
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default LandingPage 