import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "../reducers/userReducer";
import comuniReducer from "../reducers/comuniReducer";

const mainReducer = combineReducers({
  user: userReducer,
  comuni: comuniReducer,
});

const store = configureStore({
  reducer: mainReducer,
});

export default store;
