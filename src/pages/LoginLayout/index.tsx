import * as React from 'react'
import { AppContainer } from './styles'

import loginImage from '../../media/images/login.svg'
import { Box, Typography } from '@mui/material'

import { Outlet } from 'react-router-dom'

export const LoginLayout: React.FC = () => {
  return (
    <AppContainer>
      <Box className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <Typography variant="h2" color="#fff">
              Time Tracker!
            </Typography>
          </div>
          <img
            src={loginImage}
            className="image"
            alt=""
          />
        </div>

        <Outlet />
      </Box>
    </AppContainer>
  )
}
