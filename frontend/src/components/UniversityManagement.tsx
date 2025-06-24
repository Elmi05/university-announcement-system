import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add,
  Search,
  Edit,
  School,
  People,
  Assignment,
  Visibility,
  Delete,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  useUniversitiesWithStats,
  useCreateUniversity,
  useUpdateUniversity,
  useDeleteUniversity,
} from '../lib/hooks'
import { UniversityWithStats } from '../lib/universityService'

interface UniversityFormData {
  name: string
  domain: string
  admin_email: string
  admin_password: string
}

const schema = yup.object({
  name: yup.string().required('University name is required'),
  domain: yup.string().required('Domain is required'),
  admin_email: yup.string().email('Invalid email').required('Admin email is required'),
  admin_password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
})

const UniversityManagement: React.FC = () => {
  // React Query hooks
  const { data: universities = [], isLoading, error, refetch } = useUniversitiesWithStats()
  const createUniversityMutation = useCreateUniversity()
  const updateUniversityMutation = useUpdateUniversity()
  const deleteUniversityMutation = useDeleteUniversity()

  // Local state
  const [openDialog, setOpenDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editingUniversity, setEditingUniversity] = useState<UniversityWithStats | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UniversityFormData>({
    resolver: yupResolver(schema),
  })

  const handleOpenDialog = (university?: UniversityWithStats) => {
    if (university) {
      setEditingUniversity(university)
      reset({
        name: university.name,
        domain: university.domain,
        admin_email: university.admin_email || '',
        admin_password: '', // Don't pre-fill password for security
      })
    } else {
      setEditingUniversity(null)
      reset({
        name: '',
        domain: '',
        admin_email: '',
        admin_password: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUniversity(null)
    reset()
  }

  const onSubmit = async (data: UniversityFormData) => {
    if (editingUniversity) {
      // Update existing university
      updateUniversityMutation.mutate(
        {
          id: editingUniversity.id,
          data: {
            name: data.name,
            domain: data.domain,
            admin_email: data.admin_email,
          },
        },
        {
          onSuccess: () => {
            handleCloseDialog()
          },
        }
      )
    } else {
      // Create new university
      createUniversityMutation.mutate(data, {
        onSuccess: () => {
          handleCloseDialog()
        },
      })
    }
  }

  const handleDeleteUniversity = async (universityId: string, universityName: string) => {
    if (window.confirm(`Are you sure you want to delete "${universityName}"? This action cannot be undone.`)) {
      deleteUniversityMutation.mutate(universityId)
    }
  }

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.domain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedUniversities = filteredUniversities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isSubmitting = createUniversityMutation.isPending || updateUniversityMutation.isPending

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          University Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={isSubmitting}
        >
          Register University
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <School color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {isLoading ? <CircularProgress size={20} /> : universities.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Universities
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {isLoading ? <CircularProgress size={20} /> : '40K+'}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      universities.reduce((sum, u) => sum + u.announcements_count, 0)
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
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search universities by name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load universities. Please try again.
          <Button onClick={() => refetch()} sx={{ ml: 1 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Universities Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>University</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Admin Email</TableCell>
                <TableCell>Announcements</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading universities...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedUniversities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography>
                      {searchTerm ? 'No universities found matching your search' : 'No universities found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {paginatedUniversities.map((university) => (
                <TableRow key={university.id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {university.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{university.domain}</TableCell>
                  <TableCell>{university.admin_email}</TableCell>
                  <TableCell>{university.announcements_count}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>{new Date(university.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit University">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog(university)}
                          disabled={isSubmitting}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete University">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUniversity(university.id, university.name)}
                          disabled={deleteUniversityMutation.isPending}
                        >
                          {deleteUniversityMutation.isPending ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Delete />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUniversities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Registration/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUniversity ? 'Edit University' : 'Register New University'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="University Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isSubmitting}
                  {...register('name')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Domain"
                  error={!!errors.domain}
                  helperText={errors.domain?.message}
                  disabled={isSubmitting}
                  {...register('domain')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  error={!!errors.admin_email}
                  helperText={errors.admin_email?.message}
                  disabled={isSubmitting}
                  {...register('admin_email')}
                />
              </Grid>
              {!editingUniversity && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Admin Password"
                    type="password"
                    error={!!errors.admin_password}
                    helperText={errors.admin_password?.message}
                    disabled={isSubmitting}
                    {...register('admin_password')}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting 
                ? (editingUniversity ? 'Updating...' : 'Registering...') 
                : (editingUniversity ? 'Update' : 'Register')
              }
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default UniversityManagement 