/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
} from 'material-react-table';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { userData } from './types';
import axios from 'axios';

const App = () => {

    const [allUserData, setAllUserData] = useState<userData[]>()
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  
    useEffect(()=>{ 
      axios({
        method: "get",
        url: "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      }).then((res)=>(setAllUserData(res?.data)));
    },[])
    console.log(allUserData)
    const queryClient = new QueryClient();
    const columns = useMemo<MRT_ColumnDef<userData>[]>(
      () => [
        {
          accessorKey : 'id',
          header : 'Id',
          enableEditing : false,
          size : 80
        },
        {
          accessorKey : 'name',
          header : 'Name',
          muiEditTextFieldProps : {
            type : 'text',
            required : true,
            error : !!validationErrors?.name,
            helperText : validationErrors?.name,
            onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name : undefined,
            }),
          }
        },
        {
          accessorKey : 'email',
          header : 'Email',
          muiEditTextFieldProps : {
            type : 'email',
            required : true,
            error : !!validationErrors?.email,
            helperText : validationErrors?.email,
            onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email : undefined,
            }),
          }
        },
        {
          accessorKey : 'role',
          header : 'Roles',
          muiEditTextFieldProps : {
            type : 'text',
            required : true,
            error : !!validationErrors?.role,
            helperText : validationErrors?.role,
            onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              role : undefined,
            }),
          }
        }
      ],
      [validationErrors],
      )
      
    const handleSaveUser = (e : any) => {
      const index = allUserData!.findIndex((user) => {user.id == e?.value?.id})!
      if(index != -1) setAllUserData(allUserData![index] = e.value.id)
    }

    return(
      <QueryClientProvider client={queryClient}>
        {allUserData && 
        <MaterialReactTable 
        columns={columns}
        data={allUserData}
        createDisplayMode = 'modal'
        editDisplayMode = 'modal'
        enableEditing = {true}
        getRowId={(row)=>row.id}
        onCreatingRowCancel={()=>{setValidationErrors({})}}
        onEditingRowCancel={()=>{setValidationErrors({})}}
        onEditingRowSave={(e) => {handleSaveUser(e)}}
        renderEditRowDialogContent = {({ table, row, internalEditComponents })=>{
          return(
          <>
            <DialogTitle variant="h3">Edit User</DialogTitle>
            <DialogContent
              sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {internalEditComponents}
            </DialogContent>
            <DialogActions>
              <MRT_EditActionButtons variant="text" table={table} row={row} />
            </DialogActions>
          </>
          )}
        }
        renderRowActions={({ row, table })=>(
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => setAllUserData(allUserData.filter((obj) => (obj.id != row.id)))}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />  
      }
      </QueryClientProvider>
    )
  }

export default App
