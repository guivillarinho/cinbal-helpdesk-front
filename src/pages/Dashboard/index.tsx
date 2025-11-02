/* eslint-disable prettier/prettier */
import React from 'react'
import DefaultLayout from '../../shared/layouts/DefaultLayout'
import { Box, Grid, useTheme } from '@mui/material'
import { CardOpenedHelpDesks } from './components/CardHelpDesksExistentes'
import { CardHelpDesksAssumidos } from './components/CardHelpDesksAssumidos'
import { useUserContext } from '../../shared/contexts/userContext'
import { CardHelpDesksConcluidos } from './components/CardHelpdesksConcluidos'
import { CardHelpDesksEmAndamento } from './components/CardHelpDesksEmAndamento'
import { useFetch } from '../../shared/hooks/useFetch'
import HelpDeskProps from '../../shared/types/helpdeskType'


const Dashboard: React.FC = () => {
  const theme = useTheme()

  const { user } = useUserContext()
  const currentUser = user

  const { data } = useFetch('http://localhost:3545/helpdesk/')


  const helpDesksInProgress = data?.filter((helpDesk: HelpDeskProps) => {
    return helpDesk.status === 'Em Andamento'
  })

  const completedHelpDesks = data?.filter((helpDesk: HelpDeskProps) => {
    return helpDesk.status === 'Concluído'
  })

  return (
    <DefaultLayout  
      tituloPagina="Dashboard" 
      mostrarBotaoTema       
      mostrarBotaoLogout
      mostrarBotaoPerfil 
      mostrarBotaoHome={currentUser?.role === "admin"}
      mostrarBotaoOpenHelpDesk
      barraDeFerramentas={''}
      showNotificationButton
    >
      <Box         
          padding={2}
          borderRadius={1}
          marginX={1}
          width="auto"
          border="1px solid"
          height="max-content"
          borderColor={theme.palette.divider}
        >
        <Grid container spacing={2}>
          <Grid item xl={3} md={4} xs={12}>
            {currentUser?.role === "admin" && <CardOpenedHelpDesks numberOfOpened={data?.length}/>}
          </Grid>
          <Grid item xl={3} md={4} xs={12}>
            {currentUser?.role === "admin" && <CardHelpDesksConcluidos numberOfCompleted={completedHelpDesks?.length}/>}
          </Grid>
          <Grid item xl={3} md={4} xs={12}>
            {currentUser?.role === "admin" && <CardHelpDesksEmAndamento quantityInProgress={helpDesksInProgress?.length}/>}
          </Grid>
          <Grid item md={12} lg={12} xl={6} xs={12}>
            {currentUser?.role === "admin" && <CardHelpDesksAssumidos />}
          </Grid>
        </Grid>
      </Box>
    </DefaultLayout>)
}

export default Dashboard
