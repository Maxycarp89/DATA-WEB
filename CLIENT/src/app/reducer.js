import { createSlice } from "@reduxjs/toolkit";


const initialState = {value:0};

const useSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        setName: (state,action) =>{
            state.name = action.payload;
        },
    }
})

export const {setName} = useSlice.actions;

export default useSlice.reducer;