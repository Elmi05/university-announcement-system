import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  School,
  Person,
  Email,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface University {
  id: string
  name: string
  domain: string
  created_at: string
  updated_at: string
}

interface UniversityUser {
  id: string
  university_id: string
  email: string
  first_name: string
  last_name: string
  student_id: string | null
  department: string | null
  year_level: string | null
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
  university?: University
}

interface UniversityUserFormData {
  university_id: string
  email: string
  first_name: string
  last_name: string
  student_id: string
  department: string
  year_level: string
  status: 'active' | 'inactive' | 'suspended'
}

const universityUserSchema = yup.object({
  university_id: yup.string().required('University is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  student_id: yup.string().required('Student ID is required'),
  department: yup.string().required('Department is required'),
  year_level: yup.string().required('Year level is required'),
  status: yup.string().oneOf(['active', 'inactive', 'suspended']).required('Status is required'),
})

const yearLevels = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD']

const UniversityUserManagement: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UniversityUser | null>(null)
  const queryClient = useQueryClient()

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UniversityUserFormData>({
    resolver: yupResolver(universityUserSchema),
    defaultValues: {
      university_id: '',
      email: '',
      first_name: '',
      last_name: '',
      student_id: '',
      department: '',
      year_level: '',
      status: 'active',
    },
  })

  // Fetch universities for dropdown
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    },
  })

  // Fetch university users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['university-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('university_users')
        .select(`
          *,
          university:universities(id, name, domain)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UniversityUserFormData) => {
      const { data, error } = await supabase
        .from('university_users')
        .insert([userData])
        .select()
      
      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-users'] })
      toast.success('University user created successfully!')
      handleClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create university user')
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: UniversityUserFormData }) => {
      const { data, error } = await supabase
        .from('university_users')
        .update(userData)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-users'] })
      toast.success('University user updated successfully!')
      handleClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update university user')
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('university_users')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-users'] })
      toast.success('University user deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete university user')
    },
  })

  const handleClose = () => {
    setOpen(false)
    setEditingUser(null)
    reset()
  }

  const handleEdit = (user: UniversityUser) => {
    setEditingUser(user)
    reset({
      university_id: user.university_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      student_id: user.student_id || '',
      department: user.department || '',
      year_level: user.year_level || '',
      status: user.status,
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this university user?')) {
      deleteUserMutation.mutate(id)
    }
  }

  const onSubmit = (data: UniversityUserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData: data })
    } else {
      createUserMutation.mutate(data)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'default'
      case 'suspended': return 'error'
      default: return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          University Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add User
        </Button>
      </Box>

      {users.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No university users found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Get started by adding your first university user.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpen(true)}
              >
                Add First User
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>University</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Year Level</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Person sx={{ mr: 1, color: 'text.secondary' }} />
                          {user.first_name} {user.last_name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                          {user.email}
                        </Box>
                      </TableCell>
                      <TableCell>{user.student_id}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <School sx={{ mr: 1, color: 'primary.main', fontSize: 16 }} />
                          {user.university?.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.year_level}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEdit(user)}
                            size="small"
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(user.id)}
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* User Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit University User' : 'Add University User'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <Controller
                name="university_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.university_id}>
                    <InputLabel>University</InputLabel>
                    <Select {...field} label="University">
                      {universities.map((university) => (
                        <MenuItem key={university.id} value={university.id}>
                          {university.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.university_id && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errors.university_id.message}
                      </Alert>
                    )}
                  </FormControl>
                )}
              />

              <Box display="flex" gap={2}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  )}
                />
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </Box>

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />

              <Controller
                name="student_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Student ID"
                    fullWidth
                    error={!!errors.student_id}
                    helperText={errors.student_id?.message}
                  />
                )}
              />

              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Department"
                    fullWidth
                    error={!!errors.department}
                    helperText={errors.department?.message}
                  />
                )}
              />

              <Box display="flex" gap={2}>
                <Controller
                  name="year_level"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.year_level}>
                      <InputLabel>Year Level</InputLabel>
                      <Select {...field} label="Year Level">
                        {yearLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.year_level && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {errors.year_level.message}
                        </Alert>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                      </Select>
                      {errors.status && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {errors.status.message}
                        </Alert>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {createUserMutation.isPending || updateUserMutation.isPending ? (
                <CircularProgress size={20} />
              ) : editingUser ? (
                'Update User'
              ) : (
                'Create User'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default UniversityUserManagement 