import React, { useState, useEffect } from 'react'
import DefaultLayout from '../../layouts/DefaultLayout'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  List,
  ListItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import BarraFerramentasListagemDeChamados from '../BarraFerramentasListagemDeChamados'

import api from '../../../service/api/config/configApi'
import { useDrawerContext } from '../../contexts/DrawerContext'
import { useHelpDeskContext } from '../../contexts/HelpDeskContext'
import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format } from 'date-fns'
import Chamado from '../Chamado'
import { HelpDeskListProp } from '../../types/helpdeskType'
import { useUserContext } from '../../contexts/userContext'

export const ListagemDeChamados: React.FC = () => {
  const [helpDeskData, setHelpDeskData] = useState<HelpDeskListProp[]>([])
  const [filteredHelpDeskDataByDate, setFilteredHelpDeskDataByDate] = useState<
    HelpDeskListProp[]
  >([])
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTextField, setSearchTextField] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showRemoveFilter, setShowRemoveFilter] = useState(false)
  const [
    showMessageIfNotExistHelpDeskFilteredByDate,
    setShowMessageIfNotExistHelpDeskFilteredByDate,
  ] = useState(false)

  const theme = useTheme()
  const smDown = useMediaQuery(theme.breakpoints.down('sm'))

  const { toggleDrawerOpen } = useDrawerContext()
  const { isNewHelpDesk } = useHelpDeskContext()
  const token = localStorage.getItem('access_token')

  const { user } = useUserContext()
  const currentUser = user

  useEffect(() => {
    setIsLoading(true)
    api
      .get<HelpDeskListProp[]>('/helpdesk', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { data } = response
        setIsLoading(false)

        setHelpDeskData(data)
        setFilteredHelpDeskDataByDate(data)
        if (isNewHelpDesk) {
          setHelpDeskData(data)
        }
      })
      .catch((error) => {
        console.error(error)
        alert('Ocorreu um erro ao buscar os chamados')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewHelpDesk])

  const filteredBySearchTextField =
    searchTextField.length > 0
      ? helpDeskData!.filter((helpDesk) => {
          return (
            (helpDesk.title &&
              helpDesk.title
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.description &&
              helpDesk.description
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.category &&
              helpDesk.category
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.user.name &&
              helpDesk.user.name
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.id &&
              helpDesk.id.toLowerCase().includes(searchTextField.toLowerCase()))
          )
        })
      : []

  const filteredHelpDeskListByUser = helpDeskData.filter((helpDesk) => {
    return helpDesk.user.name === currentUser?.name
  })

  const filteredHelpDeskListBySearchTextFieldInUserProfile =
    searchTextField.length > 0
      ? filteredHelpDeskListByUser!.filter((helpDesk) => {
          return (
            (helpDesk.title &&
              helpDesk.title
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.description &&
              helpDesk.description
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.category &&
              helpDesk.category
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.user.name &&
              helpDesk.user.name
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.id &&
              helpDesk.id.toLowerCase().includes(searchTextField.toLowerCase()))
          )
        })
      : []

  const triggerSelectDate = (date: any) => {
    const filterByDate = filteredHelpDeskDataByDate.filter(
      (helpDesk) =>
        format(new Date(helpDesk.createdAt), 'dd-MM-yyyy') ===
        format(date, 'dd-MM-yyyy'),
    )
    setSelectedDate(date)

    if (filterByDate) {
      setShowRemoveFilter(true)
      setHelpDeskData(filterByDate)
      setShowMessageIfNotExistHelpDeskFilteredByDate(false)
    }

    if (filterByDate.length <= 0) {
      setShowMessageIfNotExistHelpDeskFilteredByDate(true)
    }
  }

  const triggerOpenFilterDialog = () => {
    setOpenFilterDialog(true)
  }
  const triggerCloseFilterDialog = () => {
    setOpenFilterDialog(false)
  }

  const removeFilter = () => {
    setHelpDeskData(filteredHelpDeskDataByDate)
    setShowRemoveFilter(false)
    setSelectedDate(undefined)
    setShowMessageIfNotExistHelpDeskFilteredByDate(false)
  }

  return (
    <DefaultLayout
      tituloPagina={'Time Tracker'}
      mostrarTituloPagina={true}
      mostrarBotaoTema={false}
      barraDeFerramentas={
        <BarraFerramentasListagemDeChamados
          mostrarInputBusca
          mostrarBotaoFiltro
          mostrarBotaoLimparFiltro={showRemoveFilter}
          textoBusca={searchTextField}
          aoMudarTextoDeBusca={(value) => {
            setSearchTextField(value)
          }}
          aoClicarBotaoFiltro={triggerOpenFilterDialog}
          aoClicarBotaoLimparFiltro={removeFilter}
        />
      }
    >
      {isLoading && <LinearProgress variant="indeterminate" />}
      {searchTextField.length > 0 ? (
        filteredBySearchTextField.length === 0 ? (
          <Typography variant="body2" sx={{ marginLeft: '10px' }}>
            Nenhum chamado correspondente
          </Typography>
        ) : currentUser?.role === 'admin' ? (
          <List
            sx={{
              overflow: 'auto',
              padding: '0px',
            }}
          >
            {filteredBySearchTextField.map((UniqueHelpDesk) => (
              <ListItem key={UniqueHelpDesk.id} disablePadding>
                <Chamado
                  id={UniqueHelpDesk.id}
                  author={UniqueHelpDesk.user.name}
                  title={UniqueHelpDesk.title}
                  category={UniqueHelpDesk.category}
                  description={UniqueHelpDesk.description}
                  maxLines={2}
                  createdAt={new Date(UniqueHelpDesk.createdAt)}
                  countFiles={UniqueHelpDesk.countFiles}
                  onClick={smDown ? toggleDrawerOpen : undefined}
                  to={`chamado/detalhe/${UniqueHelpDesk.id}`}
                  status={UniqueHelpDesk.status}
                />
              </ListItem>
            ))}
          </List>
        ) : currentUser?.role === 'user' ? (
          <List
            sx={{
              overflow: 'auto',
              padding: '0px',
            }}
          >
            {filteredHelpDeskListBySearchTextFieldInUserProfile.map(
              (UniqueHelpDesk) => (
                <ListItem key={UniqueHelpDesk.id} disablePadding>
                  <Chamado
                    id={UniqueHelpDesk.id}
                    author={UniqueHelpDesk.user.name}
                    title={UniqueHelpDesk.title}
                    category={UniqueHelpDesk.category}
                    description={UniqueHelpDesk.description}
                    maxLines={2}
                    createdAt={new Date(UniqueHelpDesk.createdAt)}
                    countFiles={UniqueHelpDesk.countFiles}
                    onClick={smDown ? toggleDrawerOpen : undefined}
                    to={`chamado/detalhe/${UniqueHelpDesk.id}`}
                    status={UniqueHelpDesk.status}
                  />
                </ListItem>
              ),
            )}
          </List>
        ) : (
          []
        )
      ) : currentUser?.role === 'admin' ? (
        <List sx={{ overflow: 'auto', padding: '0px' }}>
          {helpDeskData.map((UniqueHelpDesk) => (
            <ListItem key={UniqueHelpDesk.id} disablePadding>
              <Chamado
                id={UniqueHelpDesk.id}
                author={UniqueHelpDesk.user.name}
                title={UniqueHelpDesk.title}
                category={UniqueHelpDesk.category}
                description={UniqueHelpDesk.description}
                maxLines={2}
                createdAt={new Date(UniqueHelpDesk.createdAt)}
                countFiles={UniqueHelpDesk.countFiles}
                onClick={smDown ? toggleDrawerOpen : undefined}
                to={`chamado/detalhe/${UniqueHelpDesk.id}`}
                status={UniqueHelpDesk.status}
              />
            </ListItem>
          ))}
        </List>
      ) : currentUser?.role === 'user' ? (
        filteredHelpDeskListByUser.map((userHelpDesk) => (
          <ListItem key={userHelpDesk.id} disablePadding>
            <Chamado
              id={userHelpDesk.id}
              author={userHelpDesk.user.name}
              title={userHelpDesk.title}
              category={userHelpDesk.category}
              description={userHelpDesk.description}
              maxLines={2}
              createdAt={new Date(userHelpDesk.createdAt)}
              countFiles={userHelpDesk.countFiles}
              onClick={smDown ? toggleDrawerOpen : undefined}
              to={`chamado/detalhe/${userHelpDesk.id}`}
              status={userHelpDesk.status}
            />
          </ListItem>
        ))
      ) : (
        ''
      )}

      {currentUser?.role === 'user' &&
        filteredHelpDeskListByUser.length === 0 && (
          <Typography variant="body2" sx={{ marginLeft: '10px' }}>
            Você ainda não tem nenhum chamado aberto!
          </Typography>
        )}

      {currentUser?.role === 'admin' &&
        showMessageIfNotExistHelpDeskFilteredByDate && (
          <Typography variant="body2" sx={{ marginLeft: '10px' }}>
            Nenhum chamado nesta data
          </Typography>
        )}
      {currentUser?.role === 'user' &&
        showMessageIfNotExistHelpDeskFilteredByDate && (
          <Typography variant="body2" sx={{ marginLeft: '10px' }}>
            Nenhum chamado nesta data
          </Typography>
        )}

      <Dialog open={openFilterDialog} onClose={triggerCloseFilterDialog}>
        <DialogTitle>Filtrar chamados por data</DialogTitle>
        <Divider />
        <DialogContent>
          <DatePicker value={selectedDate} onChange={triggerSelectDate} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={triggerCloseFilterDialog}
            variant="contained"
            color="primary"
            sx={{ width: '90%', marginX: 'auto' }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </DefaultLayout>
  )
}
