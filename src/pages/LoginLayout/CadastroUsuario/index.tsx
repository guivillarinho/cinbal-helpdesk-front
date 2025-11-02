/* eslint-disable no-undef */
import React, { useState } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import api from '../../../service/api/config/configApi'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Button,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  Divider,
  useTheme,
  Snackbar,
  Select,
  MenuItem,
  SelectChangeEvent,
  SnackbarContent,
  Alert,
  FormControl,
  InputLabel,
} from '@mui/material'
import { MdOutlineErrorOutline } from 'react-icons/md'

interface User {
  name: string
  email: string
  password: string
  extension: string
  position: string
  sector: string
  branch: string
}

const createUserFormSchema = z.object({
  name: z
    .string()
    .nonempty('Esse campo é obrigatório!')
    .transform((name) => {
      return name
        .trim()
        .split(' ')
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1))
        })
        .join('')
    }),
  email: z
    .string()
    .email('Formato de e-mail inválido!')
    .nonempty('Esse campo é obrigatório!')
    .endsWith('@cinbal.com.br', 'O e-mail precisa ser da Cinbal!'),
  password: z
    .string()
    .nonempty('Esse campo é obrigatório!')
    .min(6, 'A senha precisa ter pelo menos 6 caracteres!'),
  extension: z.string().max(4, 'Esse campo deve ter no máximo 4 números!'),
  position: z.string().nonempty('Esse campo é obrigatório!'),
  sector: z.string().nonempty('Esse campo é obrigatório!'),
  branch: z.string().nonempty('Esse campo é obrigatório!'),
})

type CreateUserFormData = z.infer<typeof createUserFormSchema>

export const CadastroUsuario: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [extension, setExtension] = useState('')
  const [position, setPosition] = useState('')
  const [sector, setSector] = useState('')
  const [branch, setBranch] = useState('')

  const [openSuccessMessage, setOpenSuccessMessage] = useState(false)
  const [openErrorMessage, setOpenErrorMessage] = useState(false)

  const navigate = useNavigate()
  const theme = useTheme()

  const [responseApi, setResponseApi] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      position: '',
      sector: '',
      branch: '',
      extension: '',
    },
  })

  const createUser: SubmitHandler<User> = async () => {
    setIsLoading(false)
    const formData = new FormData()

    formData.append('name', name)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('extension', extension)
    formData.append('position', position)
    formData.append('sector', sector)
    formData.append('branch', branch)

    const headers = {
      headers: {
        'content-type': 'application/json',
      },
    }
    try {
      setIsLoading(true)
      await api.post<User>('/auth/register', formData, headers).then(() => {
        setOpenSuccessMessage(true)
        setIsLoading(false)
        navigate('/login')
      })
    } catch (error: any) {
      console.error(error)
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setResponseApi(error.response.data.message)
      }
      setIsLoading(false)
      setOpenErrorMessage(true)
    }
  }

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }

    setOpenSuccessMessage(false)
    setOpenErrorMessage(false)
  }

  return (
    <form onSubmit={handleSubmit(createUser)}>
      <Grid
        container
        direction="column"
        padding={20}
        spacing={2}
        sx={{
          [theme.breakpoints.down('sm')]: {
            padding: '30px',
          },
        }}
      >
        <Grid container item lg={6} spacing={2}>
          <Grid item lg={12} sm={12} xs={12}>
            <Typography
              variant="h5"
              sx={{ marginBottom: '5px', fontWeight: '400', fontSize: '16px' }}
            >
              Dados do colaborador
            </Typography>
            <Divider sx={{ marginBottom: '10px' }} />
            <TextField
              {...register('name')}
              name="name"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={
                <Typography variant="body2" color="error">
                  {errors.name && <span>{errors.name?.message}</span>}
                </Typography>
              }
              autoComplete="username"
              fullWidth
              disabled={isLoading}
              size="small"
            />
          </Grid>
          <Grid item lg={12} sm={12} xs={12}>
            <TextField
              {...register('email')}
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={
                <Typography variant="body2" color="error">
                  {errors.email && <span>{errors.email?.message}</span>}
                </Typography>
              }
              type="email"
              placeholder="nome.sobrenome@cinbal.com.br"
              fullWidth
              disabled={isLoading}
              size="small"
            />
          </Grid>
          <Grid item lg={12} sm={12} xs={12}>
            <TextField
              {...register('password')}
              name="password"
              error={!!errors.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={
                <Typography variant="body2" color="error">
                  {errors.password && <span>{errors.password?.message}</span>}
                </Typography>
              }
              type="password"
              placeholder="Senha"
              autoComplete="current-password"
              fullWidth
              disabled={isLoading}
              size="small"
            />
            <Alert severity="info">
              A senha deve ter no mínimo 6 caracteres, 1 caractere maiúsculo, 1
              minúsculo, 1 número e um caractere especial.
            </Alert>
          </Grid>
          <Grid item lg={12} sm={12} xs={12}>
            <Typography
              variant="h5"
              sx={{ marginBottom: '5px', fontWeight: '400', fontSize: '16px' }}
            >
              Informações profissionais do colaborador na Cinbal
            </Typography>
            <Divider sx={{ marginBottom: '10px' }} />
            <TextField
              {...register('position')}
              name="position"
              error={!!errors.position}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              helperText={
                <Typography variant="body2" color="error">
                  {errors.position && <span>{errors.position?.message}</span>}
                </Typography>
              }
              type="text"
              placeholder="Função"
              fullWidth
              disabled={isLoading}
              size="small"
            />
          </Grid>
          <Grid item lg={12} sm={12} xs={12}>
            <TextField
              {...register('sector')}
              name="sector"
              error={!!errors.sector}
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              helperText={
                <Typography variant="body2" color="error">
                  {errors.sector && <span>{errors.sector?.message}</span>}
                </Typography>
              }
              type="text"
              placeholder="Setor"
              fullWidth
              disabled={isLoading}
              size="small"
            />
          </Grid>
          <Grid
            item
            container
            direction={'row'}
            lg={12}
            sm={12}
            xs={12}
            spacing={2}
          >
            <Grid item lg={6} xs={12}>
              <TextField
                {...register('extension')}
                name="extension"
                error={!!errors.extension}
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                helperText={
                  <Typography variant="body2" color="error">
                    {errors.extension && (
                      <span>{errors.extension?.message}</span>
                    )}
                  </Typography>
                }
                type="tel"
                placeholder="Ramal"
                fullWidth
                disabled={isLoading}
                inputMode="numeric"
                size="small"
              />
            </Grid>
          </Grid>
          <Grid
            container
            item
            xl={12}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            spacing={2}
          >
            <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
              <Button
                type="submit"
                variant="outlined"
                sx={{ width: '100%' }}
                onClick={() => navigate('/login')}
              >
                Voltar
              </Button>
              <Snackbar
                open={openErrorMessage}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert
                  variant="filled"
                  color="error"
                  onClose={handleClose}
                  icon={<MdOutlineErrorOutline />}
                >
                  {responseApi}
                </Alert>
              </Snackbar>
            </Grid>
            <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={isLoading}
                sx={{
                  width: '100%',
                  marginBottom: '10px',
                  [theme.breakpoints.down('lg')]: { marginBottom: '0px' },
                }}
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
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
              <Snackbar
                open={openSuccessMessage}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <SnackbarContent message={'Usuário cadastrado com sucesso!'} />
              </Snackbar>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  )
}
