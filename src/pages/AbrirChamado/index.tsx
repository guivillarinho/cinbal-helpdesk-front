import React, { useState } from 'react'
import api from '../../service/api/config/configApi'
import { uniqueId } from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import {
  Button,
  Box,
  TextField,
  Grid,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  SelectChangeEvent,
  List,
  ListItem,
  Card,
  FormControl,
  InputLabel,
} from '@mui/material'
import DefaultLayout from '../../shared/layouts/DefaultLayout'
import { AiOutlinePaperClip } from 'react-icons/ai'
import { useHelpDeskContext } from '../../shared/contexts/HelpDeskContext'
import FileList from '../../shared/components/FileList'
import { useUserContext } from '../../shared/contexts/userContext'
import { createHelpDeskSchema } from './schema'

interface OpenHelpDesk {
  title: string
  category: string
  description: string
  status: string
  files?: File[]
}

export const AbrirChamado: React.FC = () => {
  const [textFieldTitle, setTextFieldTitle] = useState('')
  const [textFieldDescription, setTextFieldDescription] = useState('')
  const [selectFieldCategory, setSelectFieldCategory] = useState('')

  const [attachedFiles, setAttachedFiles] = useState<File[] | undefined>([])
  const [newUploadFile, setNewUploadFile] = useState<File | undefined>()

  const [openSuccessMessage, setOpenSuccessMessage] = useState(false)
  const [openErrorMessage, setOpenErrorMessage] = useState(false)

  const theme = useTheme()
  const { toggleHelpDesk, toggleLoading, isLoading } = useHelpDeskContext()

  const { user } = useUserContext()
  const currentUser = user

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createHelpDeskSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      status: 'Aberto',
      files: undefined,
    },
  })

  const PostHelpDesk: SubmitHandler<OpenHelpDesk> = async () => {
    toggleLoading()
    const token = localStorage.getItem('access_token')

    const formData = new FormData()

    formData.append('title', textFieldTitle)
    formData.append('category', selectFieldCategory)
    formData.append('description', textFieldDescription)

    for (let quantity = 0; quantity < attachedFiles!.length; quantity++) {
      const quantityDisplayed = quantity
      const attachedFilesToSend = attachedFiles![quantityDisplayed]
      formData.append('files', attachedFilesToSend)
    }

    const headers = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }

    try {
      await api.post<OpenHelpDesk>('/helpdesk', formData, headers).then(() => {
        setTextFieldTitle('')
        setTextFieldDescription('')
        setAttachedFiles([])
        setOpenSuccessMessage(true)
        toggleHelpDesk()
      })
    } catch (error) {
      console.error(error)
      setOpenErrorMessage(true)
    }

    toggleLoading()
  }

  const triggerCloseSuccessMessage = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSuccessMessage(false)
  }

  const triggerCloseErrorMessage = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenErrorMessage(false)
  }

  function triggerNewImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files![0]
    setNewUploadFile(file)
  }

  function triggerSelectNewFile() {
    if (newUploadFile !== undefined) {
      setAttachedFiles([...attachedFiles!, newUploadFile!])
    }

    setNewUploadFile(undefined)
  }

  const deleteFile = (attachedFileToDelete: any) => {
    const newListImageWithoutDeletedOne = attachedFiles!.filter((file) => {
      return file !== attachedFileToDelete
    })

    setAttachedFiles(newListImageWithoutDeletedOne)
  }

  return (
    <DefaultLayout
      tituloPagina="Cadastrar Tarefa"
      mostrarBotaoLogout
      mostrarBotaoPerfil
      mostrarBotaoTema
      mostrarBotaoHome={currentUser?.role === 'admin'}
    >
      <Box
        borderRadius={1}
        marginX={1}
        width="auto"
        border="1px solid"
        height="max-content"
        borderColor={theme.palette.divider}
      >
        <Grid
          container
          direction="column"
          padding={5}
          spacing={2}
          sx={{
            [theme.breakpoints.down('sm')]: {
              padding: '30px',
            },
          }}
        >
          <form
            className="AbrirChamadoForm"
            onSubmit={handleSubmit(PostHelpDesk)}
            method="POST"
            acceptCharset="UTF-8"
          >
            <Grid
              container
              item
              direction={'column'}
              spacing={2}
              sx={{ maxWidth: '600px' }}
            >
              <Grid item xl={4} lg={6}>
                <Box sx={{ minWidth: 120, paddingTop: 3 }}>
                  <TextField
                    {...register('title')}
                    label="Título"
                    variant="outlined"
                    disabled={isLoading}
                    value={textFieldTitle}
                    onChange={(e) => setTextFieldTitle(e.target.value)}
                    error={!!errors.title}
                    helperText={
                      errors.title && <span>{errors.title?.message}</span>
                    }
                    fullWidth
                  />
                </Box>
              </Grid>
              <Grid item xl={4}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Categoria</InputLabel>
                  <Select
                    labelId="category-select-label"
                    label="Categoria"
                    {...register('category')}
                    disabled={isLoading}
                    value={selectFieldCategory}
                    onChange={(event: SelectChangeEvent) =>
                      setSelectFieldCategory(event.target.value)
                    }
                    error={!!errors.category}
                    fullWidth
                  >
                    <MenuItem value={'senha'}>Trocar senha</MenuItem>
                    <MenuItem value={'att'}>Atualização Fluig</MenuItem>
                    <MenuItem value={'logs'}>Envio de logs</MenuItem>
                    <MenuItem value={'Fluig'}>Fluig</MenuItem>
                    <MenuItem value={'Outros'}>Outros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item>
                <TextField
                  {...register('description')}
                  name="description"
                  label="Descrição"
                  type="text"
                  variant="outlined"
                  value={textFieldDescription}
                  multiline
                  rows={4}
                  sx={{ width: '100%', marginBottom: '20px' }}
                  onChange={(e) => setTextFieldDescription(e.target.value)}
                  disabled={isLoading}
                  error={!!errors.description}
                  helperText={
                    errors.description && (
                      <span>{errors.description?.message}</span>
                    )
                  }
                />
              </Grid>
            </Grid>
            <Box maxWidth={585}>
              {attachedFiles && attachedFiles.length > 0 && (
                <Box
                  borderRadius={'8px'}
                  component={Card}
                  elevation={0}
                  padding={1}
                >
                  <List
                    sx={{
                      overflow: 'auto',
                      display: 'flex',
                    }}
                  >
                    {attachedFiles.map((file) => {
                      return (
                        <ListItem
                          key={uniqueId(String(file.lastModified))}
                          sx={{
                            padding: '0',
                            marginX: '4px',
                            width: 'max-content',
                          }}
                        >
                          <FileList file={file} onDeleteFile={deleteFile} />
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              )}
            </Box>

            <Box maxWidth={585} paddingY={2}>
              <Alert severity="info">
                Serão aceitos no máximo 3 arquivos de até 2mb
              </Alert>
            </Box>

            <Box
              display={'flex'}
              maxWidth={585}
              height={50}
              alignItems={'center'}
              gap={2}
            >
              <Tooltip title="Anexar arquivo" placement="top" arrow>
                <IconButton
                  className="upload"
                  component="label"
                  color="primary"
                  onChange={triggerSelectNewFile}
                  disabled={isLoading}
                >
                  <input
                    {...register('files')}
                    id="file-input"
                    hidden
                    // accept="image/*"
                    type="file"
                    multiple
                    disabled={isLoading}
                    onChange={(e) => {
                      setAttachedFiles([...attachedFiles!, ...e.target.files!])
                      triggerNewImageChange(e)
                    }}
                  />
                  <AiOutlinePaperClip size={25} />
                </IconButton>
              </Tooltip>
              <Divider variant="middle" orientation="vertical" />
              <Button
                type="submit"
                disabled={isLoading}
                disableElevation
                variant="contained"
                sx={{ width: '100%' }}
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
                {isLoading ? 'Enviando...' : 'Iniciar tarefa'}
              </Button>
            </Box>

            <Snackbar
              open={openSuccessMessage}
              autoHideDuration={6000}
              onClose={triggerCloseSuccessMessage}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert severity="success" onClose={triggerCloseSuccessMessage}>
                Tarefa inciada com sucesso!
              </Alert>
            </Snackbar>
            <Snackbar
              open={openErrorMessage}
              autoHideDuration={6000}
              onClose={triggerCloseErrorMessage}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert severity="error" onClose={triggerCloseErrorMessage}>
                Falha ao inciar a tarefa
              </Alert>
            </Snackbar>
          </form>
        </Grid>
      </Box>
    </DefaultLayout>
  )
}
