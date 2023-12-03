/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
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
  useMutation,
  useQueryClient,
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
      
      const validateRequired = (value: string) => !!value.length;
      
      function validateUser(user: userData) {
        return {
          firstName: !validateRequired(user.name)
          ? 'First Name is Required'
          : '',
        };
      }
      
      function useUpdateUser() {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (user: userData) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
          },
          //client side optimistic update
          onMutate: (newUserInfo: userData) => {
            queryClient.setQueryData(
              ['users'],
              (prevUsers: userData[]) =>
                prevUsers?.map((prevUser: userData) =>
                  prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
                ),
            );
          },
          // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] })
        });
      }

      const { mutateAsync: updateUser, isPending: isUpdatingUser } =useUpdateUser();
    const handleSaveUser: MRT_TableOptions<userData>['onEditingRowSave'] = async ({
      values,
      table,
    }) => {
      const newValidationErrors = validateUser(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateUser(values);
      table.setEditingRow(null); //exit editing mode
    };
  
  
    // function useDeleteUser() {
    //   const queryClient = useQueryClient();
    //   return useMutation({
    //     mutationFn: async (userId: string) => {
    //       //send api update request here
    //       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
    //       return Promise.resolve();
    //     },
    //     //client side optimistic update
    //     onMutate: (userId: string) => {
    //       queryClient.setQueryData(
    //         ['users'],
    //         (prevUsers: userData[]) =>
    //           prevUsers?.filter((user: userData) => user.id !== userId),
    //       );
    //     },
    //     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    //   });
    // }

    
    // //call DELETE hook
    // const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    // useDeleteUser();

    // const openDeleteConfirmModal = (row: MRT_Row<userData>) => {
    //   if (window.confirm('Are you sure you want to delete this user?')) {
    //     deleteUser(row.original.id);
    //   }
    // };
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
        // onEditingRowSave={handleSaveUser}
        // renderEditRowDialogContent = {({ table, row, internalEditComponents })=>{
        //   return(
        //   <>
        //     <DialogTitle variant="h3">Edit User</DialogTitle>
        //     <DialogContent
        //       sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        //     >
        //       {internalEditComponents} {/* or render custom edit components here */}
        //     </DialogContent>
        //     <DialogActions>
        //       <MRT_EditActionButtons variant="text" table={table} row={row} />
        //     </DialogActions>
        //   </>
        //   )}}
        // renderRowActions={({ row, table })=>(
        //   <Box sx={{ display: 'flex', gap: '1rem' }}>
        //     <Tooltip title="Edit">
        //       <IconButton onClick={() => table.setEditingRow(row)}>
        //         <EditIcon />
        //       </IconButton>
        //     </Tooltip>
        //     <Tooltip title="Delete">
        //       <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
        //         <DeleteIcon />
        //       </IconButton>
        //     </Tooltip>
        //   </Box>
        // )}
      />  
      }
      </QueryClientProvider>
    )
  }

export default App
