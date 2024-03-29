import React, { useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Icon,
  IconButton,
  List,
  ListItem,
  Snackbar,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material'
import { AiOutlinePaperClip } from 'react-icons/ai'
import { IoMdSend } from 'react-icons/io'
import api from '../../../../../../../service/api/config/configApi'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useHelpDeskContext } from '../../../../../../contexts/HelpDeskContext'
import FileList from '../../../../../FileList'
import { uniqueId } from 'lodash'
export interface SendMessageProps {
  messageContent: string
  helpdeskId: string
  files: File[]
}

export const MessageTextField: React.FC = () => {
  const [textFieldMessage, setTextFieldMessage] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[] | undefined>([])
  const [newUploadFile, setNewUploadFile] = useState<File | undefined>()

  const [openErrorMessage, setOpenErrorMessage] = useState(false)
  const [responseApi, setResponseApi] = useState<string>('')

  const { id } = useParams()
  const theme = useTheme()
  const { toggleMessage } = useHelpDeskContext()
  const { handleSubmit, register } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const PostMessage = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('access_token')

    const formData = new FormData()

    const headers = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `bearer ${token}`,
      },
    }
    const helpdeskId = id

    formData.append('message', textFieldMessage)
    formData.append('helpdeskId', helpdeskId!)

    for (let quantity = 0; quantity < attachedFiles!.length; quantity++) {
      const quantityDisplayed = quantity
      const attachedFilesToSend = attachedFiles![quantityDisplayed]
      formData.append('files', attachedFilesToSend)
    }

    try {
      await api
        .post<SendMessageProps>(`/comment/`, formData, headers)
        .then(() => {
          toggleMessage()
          setTextFieldMessage('')
          setAttachedFiles([])
          setIsLoading(false)
        })
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setResponseApi(error.response.data.message)
      }
      console.error(error)
      setOpenErrorMessage(true)
      setIsLoading(false)
    }
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

  function postMessageViaEnterButton(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      PostMessage()
    }
  }

  return (
    <>
      {attachedFiles && attachedFiles.length > 0 && (
        <Box borderRadius={'8px'} component={Card} elevation={0} padding={1}>
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

      <Box display={'flex'} alignItems={'flex-start'} justifyContent={'center'}>
        <form
          id="messageTextField"
          method="POST"
          onSubmit={handleSubmit(PostMessage)}
          style={{ width: '100%', display: 'flex', marginTop: '10px' }}
        >
          <TextField
            fullWidth
            {...register('message')}
            name="message"
            onKeyDown={postMessageViaEnterButton}
            placeholder="Escreva uma mensagem..."
            size={'small'}
            type="text"
            maxRows={5}
            multiline
            value={textFieldMessage}
            onChange={(e) => setTextFieldMessage(e.target.value)}
            sx={{
              bgcolor: [theme.palette.background.default],
            }}
            disabled={isLoading}
          />
        </form>
        <Box display={'flex'} marginTop={1} marginX={1}>
          <Tooltip title="Anexar arquivos" placement="top" arrow>
            <IconButton
              className="upload"
              component="label"
              color="primary"
              onChange={triggerSelectNewFile}
            >
              <input
                {...register('files')}
                id="file-input"
                hidden
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
          <Tooltip title="Enviar Chamado" placement="top" arrow>
            <IconButton
              type="submit"
              disabled={
                isLoading ||
                (attachedFiles?.length === 0 && textFieldMessage === '')
              }
              onClick={PostMessage}
            >
              <Icon>
                {isLoading ? (
                  <CircularProgress size={25} />
                ) : (
                  <IoMdSend size={20} />
                )}
              </Icon>
            </IconButton>
          </Tooltip>
          <Snackbar
            open={openErrorMessage}
            autoHideDuration={6000}
            onClose={triggerCloseErrorMessage}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert severity="error" onClose={triggerCloseErrorMessage}>
              {responseApi}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </>
  )
}
