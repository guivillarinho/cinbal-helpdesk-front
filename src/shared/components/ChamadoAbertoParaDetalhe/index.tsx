/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { memo, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import DefaultLayout from '../../layouts/DefaultLayout'
import { format, formatDistanceToNow } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

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
import { useUserHelpDeskContext } from '../../contexts/UserContext'

import { useFetch } from '../../hooks/useFetch'
import { useUser } from '../../hooks/useUser'

import HelpDeskBody from './components/HelpDeskBody'
import { HelpDeskHeader } from './components/HelpDeskHeader'
import { CommentsProps } from '../../types/helpdeskType'

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
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }
  const { id } = useParams()

  const { data, isLoading } = useFetch()
  const attachedFiles = data?.files

  const { users } = useUser(`/user`, headers)

  const theme = useTheme()
  const { accountable } = useUserHelpDeskContext()
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

  return (
    <DefaultLayout
      mostrarBotaoTema={true}
      mostrarBotaoLogout
      mostrarBotaoPerfil
      mostrarBotaoHome
      tituloPagina={''}
      barraDeFerramentas={''}
      showNotificationButton
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
        />
        <HelpDeskBody
          id={id}
          author={data?.user.name}
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
          <Grid container spacing={2} maxWidth={'100%'} paddingY={'20px'}>
            {attachedFiles!.map((file: FileProps) => (
              <Grid item xl={2} lg={6} md={6} sm={12} xs={12} key={file.id}>
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
                        <Icon>
                          <AiFillFile size={25} />
                        </Icon>
                      ) : file.mimetype === 'image/png' ||
                        file.mimetype === 'image/jpeg' ||
                        file.mimetype === 'image/gif' ||
                        file.mimetype === 'image/bmp' ? (
                        <Icon>
                          <MdImage />
                        </Icon>
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
                      <Typography fontSize={'14px'} width={'30ch'} noWrap>
                        {file.filename}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton>
                    <MdDownload />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

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
      </Box>
    </DefaultLayout>
  )
}

export default memo(ChamadoAbertoParaDetalhe)
