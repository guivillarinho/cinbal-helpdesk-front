import {
  Box,
  Card,
  CardContent,
  InputAdornment,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useFetch } from '../../../../shared/hooks/useFetch'
import { HiCollection } from 'react-icons/hi'
import { HelpDeskList } from './components/HelpDeskList'
import { useUserContext } from '../../../../shared/contexts/userContext'
import HelpDeskProps from '../../../../shared/types/helpdeskType'
import { Environment } from '../../../../shared/environment/export'
import SearchIcon from '@mui/icons-material/Search'
interface HelpDeskDashboardList {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  to: string
}

export const CardHelpDesksAssumidos: React.FC = () => {
  const { data } = useFetch('http://apihd.totvs.com.br/helpdesk')
  const { user } = useUserContext()
  const [searchTextField, setSearchTextField] = useState('')

  const currentUser = user

  const accountable = data?.filter((helpdesk: HelpDeskProps) => {
    return helpdesk.accountable === currentUser?.name
  })

  const filteredBySearchTextField =
    searchTextField.length > 0
      ? data!.filter((helpDesk: HelpDeskDashboardList) => {
          return (
            (helpDesk.title &&
              helpDesk.title
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.description &&
              helpDesk.description
                .toLowerCase()
                .includes(searchTextField.toLowerCase())) ||
            (helpDesk.id &&
              helpDesk.id.toLowerCase().includes(searchTextField.toLowerCase()))
          )
        })
      : []

  return (
    <Card elevation={0} variant="outlined">
      <CardContent>
        <Box display={'flex'} gap={'10px'} alignItems={'center'}>
          <HiCollection size={35} />
          <Box display={'flex'} flexDirection={'column'}>
            <Typography variant="h6">HelpDesks assumidos</Typography>
            <Typography variant="body2">
              Todos os chamados assumidos por você irão aparecer aqui.
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder={Environment.INPUT_DE_BUSCA}
              value={searchTextField}
              onChange={(e) => setSearchTextField(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ marginY: '10px' }}
            />
          </Box>
        </Box>
        <Box
          height={'200px'}
          overflow={'auto'}
          display={'flex'}
          flexDirection={'column'}
        >
          {searchTextField.length > 0 ? (
            filteredBySearchTextField.length === 0 ? (
              <Typography>Nenhum chamado correspondente</Typography>
            ) : (
              <List>
                {filteredBySearchTextField?.map(
                  (helpdesk: HelpDeskDashboardList) => {
                    return (
                      <ListItem key={helpdesk.id} disablePadding>
                        <HelpDeskList
                          title={helpdesk.title}
                          description={helpdesk.description}
                          status={helpdesk.status}
                          createdAt={helpdesk.createdAt}
                          to={`/home/chamado/detalhe/${helpdesk.id}`}
                          id={helpdesk.id}
                        />
                      </ListItem>
                    )
                  },
                )}
              </List>
            )
          ) : currentUser?.role === 'admin' ? (
            <List>
              {accountable?.map((helpdesk: HelpDeskDashboardList) => {
                return (
                  <ListItem key={helpdesk.id} disablePadding>
                    <HelpDeskList
                      title={helpdesk.title}
                      description={helpdesk.description}
                      status={helpdesk.status}
                      createdAt={helpdesk.createdAt}
                      to={`/home/chamado/detalhe/${helpdesk.id}`}
                      id={helpdesk.id}
                    />
                  </ListItem>
                )
              })}
            </List>
          ) : (
            []
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
