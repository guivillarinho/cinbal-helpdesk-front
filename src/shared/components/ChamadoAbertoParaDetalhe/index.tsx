/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { memo, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import DefaultLayout from '../../layouts/DefaultLayout'
import { format, formatDistanceToNow } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import api from '../../../service/api/config/configApi'
import fileDownload from 'js-file-download'

import {
  Box,
  Divider,
  Typography,
  Card,
  IconButton,
  Button,
  TextField,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { MdImage, MdDownload } from 'react-icons/md'
import { Chat } from './components/Chat'
import { AiFillFile } from 'react-icons/ai'
import { useFetch } from '../../hooks/useFetch'
import { useUser } from '../../hooks/useUser'
import HelpDeskBody from './components/HelpDeskBody'
import { HelpDeskHeader } from './components/HelpDeskHeader'
import { useUserContext } from '../../contexts/userContext'
import {
  SiMicrosoftexcel,
  SiMicrosoftpowerpoint,
  SiMicrosoftword,
} from 'react-icons/si'
import { TiDocumentText } from 'react-icons/ti'

interface FileProps {
  id: string
  filename: string
  mimetype:
    | 'image/jpeg'
    | 'image/gif'
    | 'image/png'
    | 'image/bmp'
    | 'application/pdf'
}

const ChamadoAbertoParaDetalhe: React.FC = () => {
  const token = localStorage.getItem('access_token')
  const headers = {
    headers: {
      // 'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }
  const { id } = useParams()

  const { data, isLoading } = useFetch(
    `http://localhost:3545/helpdesk/${id}`,
  )

  const attachedFiles = data?.files

  const { users } = useUser(`/user`, headers)

  const { user } = useUserContext()
  const currentUser = user

// NOVOS ESTADOS PARA O CRONÔMETRO
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // O estado agora armazena um objeto com as partes do tempo
  const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [stoppedDuration, setStoppedDuration] = useState({ hours: 0, minutes: 0, seconds: 0 })

  const theme = useTheme()
  const { accountable } = useUserContext()
  const accountableRef = useRef(accountable)

  useEffect(() => {
    accountableRef.current = accountable
  }, [accountable])

  // NOVO EFEITO PARA O CRONÔMETRO (ATUALIZA A CADA SEGUNDO)
  useEffect(() => {
    // Não rode se a data não foi carregada ou se o timer está parado
    if (!data?.createdAt || !isTimerRunning) {
      return
    }

    // Define a hora de início
    const startTime = new Date(data.createdAt).getTime()

    // Cria um intervalo que roda a cada segundo
    const intervalId = setInterval(() => {
      const now = new Date().getTime()
      
      // Calcula a diferença total em segundos
      let diffMs = now - startTime
      if (diffMs < 0) diffMs = 0; // Garante que não seja negativo
      let totalSeconds = Math.floor(diffMs / 1000)

      // Converte segundos em Horas, Minutos e Segundos
      const hours = Math.floor(totalSeconds / 3600)
      totalSeconds %= 3600
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      // Atualiza o estado
      setElapsedTime({ hours, minutes, seconds })
    }, 1000) // 1000ms = 1 segundo

    // Função de limpeza do efeito
    return () => clearInterval(intervalId)

  }, [data?.createdAt, isTimerRunning]) // Dependências

  const publishedDateFormatted = () => {
    return format(new Date(data!.createdAt), "d 'de' LLLL 'às' HH:mm'h'", {
      locale: ptBR,
    })
  }

  const publishedDateRelativeToNow = () => {
    return formatDistanceToNow(new Date(data!.createdAt), {
      locale: ptBR,
      addSuffix: true,
    })
  }

  const downloadFile = async (file: FileProps) => {
    await api
      .get(`/file/${file.id}`, {
        ...headers,
        responseType: 'blob',
      })
      .then((response) => {
        const fileName = file.filename
        fileDownload(response.data, fileName)
      })
  }

  // NOVA FUNÇÃO HELPER PARA FORMATAR O TEMPO
  const formatDuration = (duration: { hours: number, minutes: number, seconds: number }) => {
    const pad = (num: number) => num.toString().padStart(2, '0')
    return `${pad(duration.hours)}:${pad(duration.minutes)}:${pad(duration.seconds)}`
  }

  // NOVAS FUNÇÕES DE CONTROLE DO CRONÔMETRO
  const handleStopTimer = () => {
    setIsTimerRunning(false)
    setStoppedDuration(elapsedTime) // Salva o objeto de tempo atual
  }

  const handleStartTimer = () => {
    setIsTimerRunning(true)
    setIsEditing(false)
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing)
  }

  // Função para lidar com a mudança nos campos de edição
  const handleEditDuration = (part: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10) || 0 // Converte para número, ou 0 se for inválido
    
    // Atualiza a parte específica (hora, minuto ou segundo) do tempo parado
    setStoppedDuration(prev => ({
      ...prev,
      [part]: numValue
    }))
  }

  return (
    <DefaultLayout
      mostrarBotaoTema={true}
      mostrarBotaoLogout
      mostrarBotaoPerfil
      mostrarBotaoHome={currentUser?.role === 'admin'}
      tituloPagina={''}
      barraDeFerramentas={''}
      showNotificationButton
      mostrarBotaoOpenHelpDesk={true}
    >
      <Box
        padding={5}
        borderRadius={1}
        margin={1}
        width="auto"
        border="1px solid"
        height={'max'}
        borderColor={theme.palette.divider}
      >
        <HelpDeskHeader
          id={id}
          token={token}
          title={data?.title}
          helpDeskAccountable={data?.accountable}
          adminUser={users}
          isLoading={isLoading}
          status={data?.status!}
        />
        <HelpDeskBody
          id={id}
          author={data?.user}
          sector={data?.user.sector}
          category={data?.category}
          description={data?.description}
          createdAt={data?.createdAt}
          isLoading={isLoading}
          createdAtFormatted={publishedDateFormatted}
          createdAtFormattedRelativeToNow={publishedDateRelativeToNow}
        />
        <Box
          paddingY={2}
          display="flex"
          alignItems="center"
          gap={1.5}
          minHeight={50}
        >
          {/* --- ESTADO: RODANDO --- */}
          {isTimerRunning && !isLoading && (
            <>
              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                {formatDuration(elapsedTime)}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleStopTimer}
              >
                Parar
              </Button>
            </>
          )}

          {/* --- ESTADO: PARADO (NÃO EDITANDO) --- */}
          {!isTimerRunning && !isEditing && (
            <>
              <Typography variant="body2">Tempo Corrido:</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                {formatDuration(stoppedDuration)}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleStartTimer}
              >
                Reiniciar
              </Button>
              <Button size="small" onClick={handleToggleEdit}>
                Editar
              </Button>
            </>
          )}

          {/* --- ESTADO: PARADO (EDITANDO) --- */}
          {!isTimerRunning && isEditing && (
            <>
              <TextField
                label="HH"
                type="number"
                size="small"
                value={stoppedDuration.hours}
                onChange={(e) => handleEditDuration('hours', e.target.value)}
                sx={{ width: 70 }}
              />
              <Typography sx={{ fontWeight: 'bold' }}>:</Typography>
              <TextField
                label="MM"
                type="number"
                size="small"
                value={stoppedDuration.minutes}
                onChange={(e) => handleEditDuration('minutes', e.target.value)}
                sx={{ width: 70 }}
              />
              <Typography sx={{ fontWeight: 'bold' }}>:</Typography>
              <TextField
                label="SS"
                type="number"
                size="small"
                value={stoppedDuration.seconds}
                onChange={(e) => handleEditDuration('seconds', e.target.value)}
                sx={{ width: 70 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleToggleEdit}
              >
                Salvar
              </Button>
            </>
          )}
        </Box>
        <Divider />

        {data?.files && data?.files.length > 0 && (
          <Box
            display={'flex'}
            gap={2}
            maxWidth={'100%'}
            paddingY={'20px'}
            sx={{
              [theme.breakpoints.down('lg')]: {
                flexDirection: 'column',
              },
            }}
          >
            {attachedFiles!.map((file: FileProps) => (
              <Box key={file.id}>
                <Card
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    justifyContent: 'space-between',
                  }}
                  variant="outlined"
                >
                  <Box display={'flex'} alignItems={'center'} gap={'2px'}>
                    <Box margin={2}>
                      {file.mimetype === 'application/pdf' ? (
                        <AiFillFile size={25} />
                      ) : file.mimetype === 'image/png' ||
                        file.mimetype === 'image/jpeg' ||
                        file.mimetype === 'image/gif' ||
                        file.mimetype === 'image/bmp' ? (
                        <MdImage />
                      ) : file.mimetype ===
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? (
                        <SiMicrosoftexcel />
                      ) : file.mimetype ===
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                        <SiMicrosoftword />
                      ) : file.mimetype === 'text/plain' ? (
                        <TiDocumentText size={20} />
                      ) : file.mimetype ===
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ? (
                        <SiMicrosoftpowerpoint />
                      ) : (
                        ''
                      )}
                    </Box>
                    <Box
                      display={'flex'}
                      width={'200px'}
                      justifyContent={'center'}
                      flexDirection={'column'}
                    >
                      <Typography fontSize={'14px'} width={'20ch'} noWrap>
                        {file.filename}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton onClick={() => downloadFile(file)}>
                    <MdDownload />
                  </IconButton>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {data?.accountable !== accountable && data?.user.role !== user?.role ? (
          ''
        ) : data?.status === 'Em Andamento' ||
          data?.status === 'Concluído' ||
          data?.status === 'Terceiro' ? (
          <Box
            maxWidth={'1024px'}
            marginY={'10px'}
            border="1px solid"
            borderColor={theme.palette.divider}
            borderRadius={'8px'}
            padding={'10px'}
          >
            <Chat />
          </Box>
        ) : (
          ''
        )}
      </Box>
    </DefaultLayout>
  )
}

export default memo(ChamadoAbertoParaDetalhe)
