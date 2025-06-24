import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Avatar,
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
  Divider,
  useTheme,
  Paper,
  CssBaseline,
  Fade,
  Badge,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Dashboard,
  School,
  People,
  BarChart,
  Settings,
  Logout,
  Menu as MenuIcon,
  Notifications,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '../contexts/AuthContext'
import UniversityManagement from '../components/UniversityManagement'
import UniversityUserManagement from '../components/UniversityUserManagement'
import PlatformAnalytics from '../components/PlatformAnalytics'
import PlatformOverview from '../components/PlatformOverview'
import PlatformSettings from '../components/PlatformSettings'

const drawerWidth = 280

interface NavigationItem {
  text: string
  icon: React.ReactElement
  path: string
}

const navigationItems: NavigationItem[] = [
  { text: 'Overview', icon: <Dashboard />, path: '/platform/dashboard' },
  { text: 'Universities', icon: <School />, path: '/platform/dashboard/universities' },
  { text: 'University Users', icon: <People />, path: '/platform/dashboard/users' },
  { text: 'Analytics', icon: <BarChart />, path: '/platform/dashboard/analytics' },
  { text: 'Settings', icon: <Settings />, path: '/platform/dashboard/settings' },
]

const PlatformAdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
      navigate('/platform/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
    handleProfileMenuClose()
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
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
          <School />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Platform Admin
          </Typography>
          <Chip
            label="Super User"
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
            (item.path === '/platform/dashboard' && location.pathname === '/platform/dashboard/');
          
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
      
      {/* Status Indicator */}
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
            System Status
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                mr: 1,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              All systems operational
            </Typography>
          </Box>
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
            🏢 Multi-Tenant Announcement System
          </Typography>

          {/* Notification Bell */}
          <IconButton sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

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
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            }
          >
            <Box sx={{ textAlign: 'left', ml: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.email?.split('@')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Platform Admin
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
            keepMounted: true, // Better mobile performance
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
              <Route path="/" element={<PlatformOverview />} />
              <Route path="/universities" element={<UniversityManagement />} />
              <Route path="/users" element={<UniversityUserManagement />} />
              <Route path="/analytics" element={<PlatformAnalytics />} />
              <Route path="/settings" element={<PlatformSettings />} />
              <Route path="*" element={<Navigate to="/platform/dashboard" replace />} />
            </Routes>
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default PlatformAdminDashboard 