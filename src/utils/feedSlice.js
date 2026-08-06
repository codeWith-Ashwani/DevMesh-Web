import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: null,
    reducers: {
        addFeed: (state,action) =>{
            return action.payload;
        },
        appendFeed: (state, action) => {
            const existingIds = new Set(state.map((user) => user._id));
            return [...state, ...action.payload.filter((user) => !existingIds.has(user._id))];
        },
        removeUserFeed: (state,action) => {
            const newFeed = state.filter((user) => user._id !== action.payload);
            return newFeed;
        }
    },
});

export const {addFeed, appendFeed, removeUserFeed} = feedSlice.actions;
export default feedSlice.reducer;
