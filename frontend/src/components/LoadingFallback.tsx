import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingFallbackProps {
  message?: string
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="background.default"
    >
      <CircularProgress size={40} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  )
}

export default LoadingFallback 