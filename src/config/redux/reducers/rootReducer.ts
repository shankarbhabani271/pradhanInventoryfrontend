import { combineReducers } from "redux";
import authReducer from "../slice/authSlice";
// import subscriptionReducer from "../slice/subscription.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  // subscription: subscriptionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;