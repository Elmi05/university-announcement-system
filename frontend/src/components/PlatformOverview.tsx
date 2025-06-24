import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import {
  School,
  People,
  Assignment,
  TrendingUp,
} from '@mui/icons-material'
import { usePlatformStats, useRecentActivity } from '../lib/hooks'

const PlatformOverview: React.FC = () => {
  // React Query hooks
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = usePlatformStats()

  const { 
    data: recentActivity, 
    isLoading: activityLoading, 
    error: activityError, 
    refetch: refetchActivity 
  } = useRecentActivity()

  const hasError = statsError || activityError

  const handleRetry = () => {
    refetchStats()
    refetchActivity()
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Platform Overview
      </Typography>

      {/* Error State */}
      {hasError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard data. Please try again.
          <Button onClick={handleRetry} sx={{ ml: 1 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <School color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      stats?.universityCount || 0
                    )}
                  </Typography>
                  <Typography color="text.secondary">
                    Universities Registered
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      stats?.totalStudents || 0
                    )}
                  </Typography>
                  <Typography color="text.secondary">
                    University Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      stats?.announcementCount || 0
                    )}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Announcements
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      `${(stats?.growthPercentage ?? 0) >= 0 ? '+' : ''}${stats?.growthPercentage ?? 0}%`
                    )}
                  </Typography>
                  <Typography color="text.secondary">
                    Growth This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Info and Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                System Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Multi-Tenant Architecture"
                    secondary="Universities have isolated data and admin access"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Announcement System"
                    secondary="Universities can create and manage announcements"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Admin Management"
                    secondary="Platform owners can register and manage universities"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Real-time Data"
                    secondary="All statistics update automatically with React Query caching"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Recent Activity
              </Typography>
              {activityLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {recentActivity?.recentUniversities?.slice(0, 4).map((university: any, index: number) => (
                    <React.Fragment key={university.name || index}>
                      <ListItem>
                        <ListItemText
                          primary={`${university.name} registered`}
                          secondary={new Date(university.created_at).toLocaleDateString()}
                        />
                      </ListItem>
                      {index < Math.min(3, recentActivity.recentUniversities.length - 1) && <Divider />}
                    </React.Fragment>
                  ))}
                  
                  {recentActivity?.recentAnnouncements?.slice(0, 2).map((announcement: any, index: number) => (
                    <React.Fragment key={announcement.title || `announcement-${index}`}>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary={`New announcement: ${announcement.title}`}
                          secondary={`by ${announcement.universities?.name || 'Unknown'} - ${new Date(announcement.created_at).toLocaleDateString()}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}

                  {(!recentActivity?.recentUniversities?.length && !recentActivity?.recentAnnouncements?.length) && (
                    <ListItem>
                      <ListItemText
                        primary="No recent activity"
                        secondary="Universities and announcements will appear here when created"
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PlatformOverview 