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
  Icon,
  IconButton,
  Grid,
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
    `http://apihd.cinbal.com.br/helpdesk/${id}`,
  )

  const attachedFiles = data?.files

  const { users } = useUser(`/user`, headers)

  const { user } = useUserContext()
  const currentUser = user

  const theme = useTheme()
  const { accountable } = useUserContext()
  const accountableRef = useRef(accountable)

  useEffect(() => {
    accountableRef.current = accountable
  }, [accountable])

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
