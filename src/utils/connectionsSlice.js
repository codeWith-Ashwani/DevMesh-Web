import { createSlice } from "@reduxjs/toolkit";

const connectionsSlice = createSlice({
    name: "connections",
    initialState: [],
    reducers: {
        addConnections: (state, action) => {
            return action.payload;
        },
        removeConnections: () => null,

    },
});

export const {addConnections,removeConnections} = connectionsSlice.actions;
export default connectionsSlice.reducer;
