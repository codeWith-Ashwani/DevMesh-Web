import { combineReducers, configureStore } from "@reduxjs/toolkit";
import  userReducer from "./userSlice"; 
import feedReducer from "./feedSlice";
import connectionsReducer from "./connectionsSlice"
import requestsReducer from "./requestsSlice"


const reducers = combineReducers({
        user: userReducer,
        feed: feedReducer,
        connections: connectionsReducer,
        requests: requestsReducer
});
const appStore = configureStore({
    reducer: (state, action) => {
        if (action.type === 'user/removeUser' ||
            (action.type === 'user/addUser' && state?.user?._id !== action.payload?._id))
            state = undefined;
        return reducers(state, action);
    },
});

export default appStore;
