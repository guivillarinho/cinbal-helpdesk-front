import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../service/api/config/configApi'

import {
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'

// import logo from '../../../media/images/logo2-full.png'
import { SubmitHandler } from 'react-hook-form'
import { useUserContext } from '../../../shared/contexts/userContext'
interface LoginData {
  email: string
  password: string
  access_token?: string
}

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [userError, setUserError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [openErrorMessage, setOpenErrorMessage] = useState(false)

  const theme = useTheme()
  const navigate = useNavigate()
  const { setIsLogged } = useUserContext()

  const validateIfUserExistInDB: SubmitHandler<LoginData> = async (
    data,
    event,
  ) => {
    event?.preventDefault()

    try {
      const response = await api.post<LoginData>('/auth/login', {
        email: data.email,
        password: data.password,
      })

      const token = response.data.access_token
      localStorage.setItem('access_token', token!)
      return token
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const triggerLogin = async () => {
    if (!userEmail) {
      setUserError('Usuário não pode ser vazio')
      return
    }
    if (!userPassword) {
      setPasswordError('Senha não pode ser vazia')
      return
    }

    setIsLoading(true)
    const userData = await validateIfUserExistInDB({
      email: userEmail,
      password: userPassword,
    })
    setIsLoading(false)
    if (!userData) {
      setUserError('Usuário ou senha incorretos ')
      setPasswordError('Usuário ou senha incorretos ')
      setOpenErrorMessage(true)
      return
    }
    if (userData) {
      setIsLogged(true)
    }
    navigate('/home/abrir-chamado')
  }

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }

    setOpenErrorMessage(false)
  }

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      margin={'auto'}
      width={'70%'}
      maxWidth={'600px'}
      padding={'20px'}
      gap={'20px'}
      boxSizing={'border-box'}
      marginBottom={'500px'}
      sx={{
        [theme.breakpoints.down('sm')]: {
          width: '100%',
          marginTop: '250px',
        },
      }}
    >
      <Box
        display={'flex'}
        flexDirection={'column'}
        width={'100%'}
        justifyContent={'center'}
        alignItems={'center'}
        gap={2}
      >
        {/* <img src={logo} height={60} alt="Totvs App" /> */}
        <Typography>Bem vindo(a) ao seu Time Tracker!</Typography>
      </Box>

      <form
        id="form-login"
        method="POST"
        style={{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          width: '70%',
          gap: '8px',
        }}
      >
        <TextField
          label="E-mail"
          type="text"
          autoComplete="username"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          fullWidth
          disabled={isLoading}
          error={!!userError}
          onKeyDown={() => setUserError('')}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
          fullWidth
          disabled={isLoading}
          error={!!passwordError}
          onKeyDown={() => setPasswordError('')}
        />

        <Snackbar
          open={openErrorMessage}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={handleClose}>
            Usuário ou senha incorretos
          </Alert>
        </Snackbar>
      </form>

      <Box
        width="70%"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        gap={1}
      >
        <Button
          variant="contained"
          type="submit"
          disableElevation
          onClick={triggerLogin}
          disabled={isLoading}
          endIcon={
            isLoading ? (
              <CircularProgress
                variant="indeterminate"
                color="inherit"
                size={20}
                sx={{ alignSelf: 'end' }}
              />
            ) : undefined
          }
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>

        <Button
          variant="outlined"
          disableElevation
          onClick={() => navigate('/login/cadastro')}
        >
          Cadastrar
        </Button>
      </Box>
    </Box>
  )
}
