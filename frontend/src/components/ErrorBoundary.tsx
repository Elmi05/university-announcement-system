import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            <ErrorOutline 
              sx={{ 
                fontSize: 64, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              The application encountered an error. Please try refreshing the page.
            </Typography>
            {this.state.error && (
              <Typography 
                variant="body2" 
                color="error.main" 
                mb={3}
                sx={{ 
                  fontFamily: 'monospace',
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}
              >
                {this.state.error.message}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={this.handleReload}
              startIcon={<Refresh />}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 