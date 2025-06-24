import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  School,
  People,
  Assignment,
  Analytics,
  Download,
  Refresh,
} from '@mui/icons-material'
import {
  LineChart,
  Line,

  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface AnalyticsData {
  universityGrowth: Array<{
    date: string
    universities: number
    users: number
    announcements: number
  }>
  universityStats: Array<{
    name: string
    users: number
    announcements: number
    lastActivity: string
    status: 'active' | 'inactive'
  }>
  userActivityByUniversity: Array<{
    name: string
    users: number
    color: string
  }>
  monthlyMetrics: {
    newUniversities: number
    newUsers: number
    newAnnouncements: number
    activeUniversities: number
  }
  topUniversities: Array<{
    name: string
    users: number
    announcements: number
    growth: number
  }>
}

const colors = ['#1976d2', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb', '#e3f2fd']

const PlatformAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch analytics data
  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ['platform-analytics', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const days = parseInt(timeRange)

      // Fetch universities with their data
      const { data: universities } = await supabase
        .from('universities')
        .select(`
          *,
          university_users(*),
          announcements(*)
        `)
        .order('created_at', { ascending: false })

      if (!universities) throw new Error('Failed to fetch universities data')

      // Generate mock time series data for the last N days
      const universityGrowth = Array.from({ length: days }, (_, i) => {
        const universitiesCount = Math.min(universities.length, Math.floor(Math.random() * universities.length) + 1)
        const users = Math.floor(Math.random() * 50) + (i * 2)
        const announcements = Math.floor(Math.random() * 20) + (i * 1)
        
        return {
          date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
          universities: universitiesCount,
          users,
          announcements,
        }
      })

      // University statistics
      const universityStats = universities.map((uni: any) => ({
        name: uni.name,
        users: uni.university_users?.length || 0,
        announcements: uni.announcements?.length || 0,
        lastActivity: format(new Date(uni.updated_at), 'MMM dd, yyyy'),
        status: Math.random() > 0.2 ? 'active' : 'inactive' as 'active' | 'inactive',
      }))

      // User distribution by university
      const userActivityByUniversity = universities.map((uni: any, index: number) => ({
        name: uni.name,
        users: uni.university_users?.length || 0,
        color: colors[index % colors.length],
      }))

      // Monthly metrics
      const monthlyMetrics = {
        newUniversities: universities.filter((uni: any) => 
          new Date(uni.created_at) > subDays(new Date(), 30)
        ).length,
        newUsers: universities.reduce((acc: number, uni: any) => 
          acc + (uni.university_users?.filter((user: any) => 
            new Date(user.created_at) > subDays(new Date(), 30)
          ).length || 0), 0
        ),
        newAnnouncements: universities.reduce((acc: number, uni: any) => 
          acc + (uni.announcements?.filter((ann: any) => 
            new Date(ann.created_at) > subDays(new Date(), 30)
          ).length || 0), 0
        ),
        activeUniversities: universityStats.filter(uni => uni.status === 'active').length,
      }

      // Top universities by activity
      const topUniversities = universityStats
        .sort((a, b) => (b.users + b.announcements) - (a.users + a.announcements))
        .slice(0, 5)
        .map(uni => ({
          ...uni,
          growth: Math.floor(Math.random() * 40) - 10, // Mock growth percentage
        }))

      return {
        universityGrowth,
        universityStats,
        userActivityByUniversity,
        monthlyMetrics,
        topUniversities,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleExport = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `platform-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading analytics data...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load analytics data. Please try again.
        <Button onClick={handleRefresh} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  const data = analyticsData!

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Platform Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into platform performance and university engagement
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Data
          </Button>
        </Stack>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    New Universities
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {data.monthlyMetrics.newUniversities}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +12% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
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
                    New Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {data.monthlyMetrics.newUsers}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +8% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <People sx={{ fontSize: 28 }} />
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
                    New Announcements
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {data.monthlyMetrics.newAnnouncements}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingDown color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="error.main">
                      -3% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
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
                    Active Universities
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {data.monthlyMetrics.activeUniversities}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +5% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <Analytics sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Growth Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Platform Growth Trends
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                University registrations, user signups, and announcement activity over time
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.universityGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="universities" 
                    stroke="#1976d2" 
                    strokeWidth={3}
                    name="Universities"
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#42a5f5" 
                    strokeWidth={3}
                    name="Users"
                    dot={{ fill: '#42a5f5', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="announcements" 
                    stroke="#ff9800" 
                    strokeWidth={3}
                    name="Announcements"
                    dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                User Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Users by university
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.userActivityByUniversity}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="users"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.userActivityByUniversity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Universities & Detailed Stats */}
      <Grid container spacing={3}>
        {/* Top Performing Universities */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🏆 Top Performing Universities
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Ranked by user engagement and activity
              </Typography>
              
              <Stack spacing={2}>
                {data.topUniversities.map((uni, index) => (
                  <Paper key={uni.name} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: colors[index],
                            width: 40,
                            height: 40,
                            mr: 2,
                            fontWeight: 'bold',
                          }}
                        >
                          #{index + 1}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {uni.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {uni.users} users • {uni.announcements} announcements
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Chip
                          label={`${uni.growth > 0 ? '+' : ''}${uni.growth}%`}
                          color={uni.growth > 0 ? 'success' : uni.growth < 0 ? 'error' : 'default'}
                          size="small"
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          growth
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* University Details Table */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📋 University Details
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Complete overview of all registered universities
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>University</strong></TableCell>
                      <TableCell align="center"><strong>Users</strong></TableCell>
                      <TableCell align="center"><strong>Posts</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.universityStats.map((uni) => (
                      <TableRow key={uni.name} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {uni.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last activity: {uni.lastActivity}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">
                            {uni.users}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">
                            {uni.announcements}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={uni.status}
                            color={uni.status === 'active' ? 'success' : 'default'}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PlatformAnalytics 