import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Switch,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Settings,
  Security,
  Notifications,
  Storage,
  Backup,
  Update,
  AdminPanelSettings,
  Dataset,
  CloudUpload,
  Schedule,
  ExpandMore,
  ExpandLess,
  Save,
  Refresh,
  Warning,
  CheckCircle,
  Info,
  Edit,
  Delete,
  Add,
  Download,
  Upload,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const PlatformSettings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    security: false,
    notifications: false,
    backup: false,
  })

  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'University Announcement Platform',
    maintenanceMode: false,
    allowNewRegistrations: true,
    defaultLanguage: 'en',
    timezone: 'UTC',
    
    // Security Settings
    enforceStrongPasswords: true,
    sessionTimeout: 30, // minutes
    twoFactorRequired: false,
    ipWhitelist: '',
    maxLoginAttempts: 5,
    
    // Notification Settings
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    notificationRetentionDays: 30,
    
    // Storage Settings
    maxFileSize: 10, // MB
    allowedFileTypes: 'pdf,doc,docx,jpg,png,gif',
    storageQuota: 1000, // GB
    autoDeleteOldFiles: true,
    
    // Backup Settings
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
    lastBackup: new Date().toISOString(),
  })

  const queryClient = useQueryClient()

  // Mock system status data
  const { data: systemStatus } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => ({
      systemHealth: 'healthy' as 'healthy' | 'warning' | 'critical',
      uptime: '15 days, 4 hours',
      version: 'v2.1.3',
      lastUpdate: '2024-01-15',
      activeUsers: 42,
      storageUsed: '234 GB',
      storageTotal: '1 TB',
      cpuUsage: 35,
      memoryUsage: 68,
      diskUsage: 23,
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you'd save to backend
      console.log('Settings saved:', settings)
      
      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `platform-settings-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleBackupNow = async () => {
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSettings(prev => ({
        ...prev,
        lastBackup: new Date().toISOString(),
      }))
      alert('Backup created successfully!')
    } catch (error) {
      alert('Backup failed. Please try again.')
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ⚙️ Platform Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure and manage your platform settings and preferences
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportSettings}
          >
            Export Settings
          </Button>
          
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>

      {/* System Status Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🔍 System Status Overview
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                <Typography variant="h4" fontWeight="bold">
                  {systemStatus?.systemHealth === 'healthy' ? '✅' : systemStatus?.systemHealth === 'warning' ? '⚠️' : '❌'}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  System Health
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {systemStatus?.systemHealth || 'Loading...'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {systemStatus?.uptime || '...'}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  System Uptime
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Version {systemStatus?.version}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {systemStatus?.activeUsers || '...'}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  Active Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently online
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {systemStatus?.storageUsed || '...'} / {systemStatus?.storageTotal || '...'}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  Storage Usage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {systemStatus?.diskUsage}% utilized
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Settings />} label="General" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Storage />} label="Storage" />
            <Tab icon={<Backup />} label="Backup" />
            <Tab icon={<AdminPanelSettings />} label="Advanced" />
          </Tabs>
        </Box>

        {/* General Settings Tab */}
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            General Platform Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Platform Name"
                value={settings.platformName}
                onChange={(e) => handleSettingChange('platformName', e.target.value)}
                helperText="The name displayed throughout the platform"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Language</InputLabel>
                <Select
                  value={settings.defaultLanguage}
                  label="Default Language"
                  onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  label="Timezone"
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Chicago">Central Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  <MenuItem value="Europe/London">London Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Platform Controls
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    />
                  }
                  label="Maintenance Mode"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  When enabled, only administrators can access the platform
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowNewRegistrations}
                      onChange={(e) => handleSettingChange('allowNewRegistrations', e.target.checked)}
                    />
                  }
                  label="Allow New University Registrations"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Allow new universities to register on the platform
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings Tab */}
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Security & Authentication Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  These settings affect platform security. Changes may require users to re-authenticate.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Session Timeout (minutes)"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 30)}
                helperText="Automatic logout after inactivity"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Login Attempts"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                helperText="Account locked after exceeding attempts"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="IP Whitelist"
                value={settings.ipWhitelist}
                onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                helperText="Comma-separated list of allowed IP addresses (leave empty to allow all)"
                placeholder="192.168.1.1, 10.0.0.1"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Password & Authentication
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enforceStrongPasswords}
                      onChange={(e) => handleSettingChange('enforceStrongPasswords', e.target.checked)}
                    />
                  }
                  label="Enforce Strong Passwords"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Require passwords with minimum 8 characters, uppercase, lowercase, and numbers
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorRequired}
                      onChange={(e) => handleSettingChange('twoFactorRequired', e.target.checked)}
                    />
                  }
                  label="Require Two-Factor Authentication"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Mandate 2FA for all platform administrators
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Notification Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Notification Retention (days)"
                value={settings.notificationRetentionDays}
                onChange={(e) => handleSettingChange('notificationRetentionDays', parseInt(e.target.value) || 30)}
                helperText="How long to keep notification history"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Notification Channels
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotificationsEnabled}
                      onChange={(e) => handleSettingChange('emailNotificationsEnabled', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Send notifications via email to users and administrators
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotificationsEnabled}
                      onChange={(e) => handleSettingChange('smsNotificationsEnabled', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Send critical notifications via SMS (requires SMS service setup)
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotificationsEnabled}
                      onChange={(e) => handleSettingChange('pushNotificationsEnabled', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Send push notifications to mobile and web apps
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Storage Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Storage & File Management
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max File Size (MB)"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value) || 10)}
                helperText="Maximum file size for uploads"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Storage Quota (GB)"
                value={settings.storageQuota}
                onChange={(e) => handleSettingChange('storageQuota', parseInt(e.target.value) || 1000)}
                helperText="Total storage allocated for the platform"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allowed File Types"
                value={settings.allowedFileTypes}
                onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                helperText="Comma-separated list of allowed file extensions"
                placeholder="pdf,doc,docx,jpg,png,gif"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoDeleteOldFiles}
                    onChange={(e) => handleSettingChange('autoDeleteOldFiles', e.target.checked)}
                  />
                }
                label="Auto-delete Old Files"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Automatically delete files older than 365 days to save storage space
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Backup Tab */}
        <TabPanel value={currentTab} index={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Backup & Recovery Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Regular backups are essential for data protection. Ensure backup settings are properly configured.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  label="Backup Frequency"
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Backup Retention (days)"
                value={settings.backupRetentionDays}
                onChange={(e) => handleSettingChange('backupRetentionDays', parseInt(e.target.value) || 30)}
                helperText="How long to keep backup files"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoBackupEnabled}
                    onChange={(e) => handleSettingChange('autoBackupEnabled', e.target.checked)}
                  />
                }
                label="Enable Automatic Backups"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Automatically create backups according to the specified frequency
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Backup Status
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Backup />}
                  onClick={handleBackupNow}
                  size="small"
                >
                  Create Backup Now
                </Button>
              </Box>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Backup:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {format(new Date(settings.lastBackup), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label="Successful"
                      color="success"
                      size="small"
                      icon={<CheckCircle />}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Advanced Tab */}
        <TabPanel value={currentTab} index={5}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Advanced System Settings
          </Typography>
          
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              ⚠️ Advanced settings can affect system stability. Only modify these if you understand the implications.
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                System Information
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Platform Version:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {systemStatus?.version}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Database Version:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      PostgreSQL 14.2
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Node.js Version:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      v18.17.0
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Last Update:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {systemStatus?.lastUpdate}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                System Actions
              </Typography>
              
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  color="primary"
                >
                  Restart Services
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Dataset />}
                  color="info"
                >
                  Optimize Database
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  color="warning"
                >
                  Clear Cache
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Update />}
                  color="success"
                >
                  Check for Updates
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  )
}

export default PlatformSettings 