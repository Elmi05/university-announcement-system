import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  Alert,
  LinearProgress,
  CssBaseline,
  Fade,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Dashboard,
  School,
  People,
  BarChart,
  Logout,
  Menu as MenuIcon,
  Announcement,
  Person,
  TrendingUp,
  CalendarToday,
  Assignment,
} from '@mui/icons-material'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

const drawerWidth = 280

interface NavigationItem {
  text: string
  icon: React.ReactElement
  path: string
}

const navigationItems: NavigationItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/university/dashboard' },
  { text: 'Announcements', icon: <Announcement />, path: '/university/dashboard/announcements' },
  { text: 'Profile', icon: <Person />, path: '/university/dashboard/profile' },
]

// University Dashboard Overview Component
const UniversityOverview: React.FC = () => {
  const { userProfile, universityId } = useAuth()

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['university-announcements', universityId],
    queryFn: async () => {
      if (!universityId) return []
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('university_id', universityId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data
    },
    enabled: !!universityId,
  })

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                fontSize: '2rem',
              }}
            >
              {userProfile?.first_name?.charAt(0) || 'U'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {userProfile?.first_name}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {userProfile?.university_name}
            </Typography>
            <Stack direction="row" spacing={1} mt={2}>
              <Chip
                label={userProfile?.department}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
              <Chip
                label={userProfile?.year_level}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
              <Chip
                label={`ID: ${userProfile?.student_id}`}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    New Announcements
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {announcements?.filter(a => new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Announcement sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Announcements
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {announcements?.length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <Assignment sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    My University
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {userProfile?.university_name}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <School sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Account Status
                  </Typography>
                  <Chip label="Active" color="success" />
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Person sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Announcements */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📢 Recent Announcements
          </Typography>
          
          {isLoading ? (
            <Typography>Loading announcements...</Typography>
          ) : announcements?.length === 0 ? (
            <Alert severity="info">
              No announcements available at this time.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {announcements?.slice(0, 5).map((announcement) => (
                <Paper key={announcement.id} sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {announcement.title}
                    </Typography>
                    <Chip 
                      label={format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {announcement.content}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={2}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Posted {format(new Date(announcement.created_at), 'PPP')}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

// Announcements Page Component
const UniversityAnnouncements: React.FC = () => {
  const { universityId } = useAuth()

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['all-university-announcements', universityId],
    queryFn: async () => {
      if (!universityId) return []
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('university_id', universityId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!universityId,
  })

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        📢 All Announcements
      </Typography>
      
      {isLoading ? (
        <Typography>Loading announcements...</Typography>
      ) : announcements?.length === 0 ? (
        <Alert severity="info">
          No announcements available from your university.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {announcements?.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h5" fontWeight="bold">
                    {announcement.title}
                  </Typography>
                  <Chip 
                    label={format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                    color="primary"
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {announcement.content}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" alignItems="center" justifyContent="between">
                  <Box display="flex" alignItems="center">
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Posted {format(new Date(announcement.created_at), 'PPP')} at {format(new Date(announcement.created_at), 'p')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}

// Profile Page Component
const UniversityProfile: React.FC = () => {
  const { userProfile, user } = useAuth()

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        👤 My Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                }}
              >
                {userProfile?.first_name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {userProfile?.first_name} {userProfile?.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip label="Active Student" color="success" />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📋 Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Student ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {userProfile?.student_id}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    University
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {userProfile?.university_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {userProfile?.department}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Year Level
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {userProfile?.year_level}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {user?.email}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Chip label="Active" color="success" size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const UniversityAdminDashboard: React.FC = () => {
  const { userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Successfully signed out')
      navigate('/university/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
    handleProfileMenuClose()
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        }}
      >
        <Avatar
          sx={{
            width: 50,
            height: 50,
            bgcolor: 'rgba(255,255,255,0.2)',
            mr: 2,
          }}
        >
          {userProfile?.first_name?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {userProfile?.first_name} {userProfile?.last_name}
          </Typography>
          <Chip
            label="University User"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '0.7rem',
            }}
          />
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/university/dashboard' && location.pathname === '/university/dashboard/');
          
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path)
                setMobileOpen(false)
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.3s ease',
                bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(8px)',
                },
                '&:active': {
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: 'white',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive ? 600 : 400,
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
      
      {/* University Info */}
      <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        <Paper
          sx={{
            p: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            University
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {userProfile?.university_name}
          </Typography>
        </Paper>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🎓 {userProfile?.university_name} Portal
          </Typography>

          {/* User Profile */}
          <Button
            onClick={handleProfileMenuOpen}
            sx={{
              textTransform: 'none',
              borderRadius: 3,
              px: 2,
              py: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
            startIcon={
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                }}
              >
                {userProfile?.first_name?.charAt(0) || 'U'}
              </Avatar>
            }
          >
            <Box sx={{ textAlign: 'left', ml: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {userProfile?.first_name} {userProfile?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userProfile?.student_id}
              </Typography>
            </Box>
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              },
            }}
          >
            <MenuItem onClick={handleSignOut} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Fade in timeout={500}>
          <Box>
            <Routes>
              <Route path="/" element={<UniversityOverview />} />
              <Route path="/announcements" element={<UniversityAnnouncements />} />
              <Route path="/profile" element={<UniversityProfile />} />
              <Route path="*" element={<Navigate to="/university/dashboard" replace />} />
            </Routes>
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default UniversityAdminDashboard 