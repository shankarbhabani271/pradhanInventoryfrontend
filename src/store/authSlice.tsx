import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const token = localStorage.getItem("token");
const loginTime = localStorage.getItem("loginTime");

const TEN_MIN = 10 * 60 * 1000;

// ✅ check expiry at start
let isValid = false;

if (token && loginTime) {
  const diff = Date.now() - Number(loginTime);
  isValid = diff < TEN_MIN;
}

const initialState: AuthState = {
  token: isValid ? token : null,
  isAuthenticated: isValid,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload);
      localStorage.setItem("loginTime", Date.now().toString()); // ✅ save time
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;