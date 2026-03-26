import { AuthAPI } from "@/controller/auth/auth.controller";
import { handleApiError } from "@/lib/errors/handleApiError";
import type { ILoginResponse } from "@/types/user.type";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export interface LoginData {
  email: string;
  password: string;
}

interface IAuthState {
  accessToken: string | null;
  isAuthLoading: boolean;
}

const initialState: IAuthState = {
  accessToken: null,
  isAuthLoading: false,
};

export const login = createAsyncThunk<
  ILoginResponse,
  LoginData,
  { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
  try {
    const { data: res } = await AuthAPI.login(data);
    return {
      accessToken: res!.accessToken,
    };
  } catch (error) {
    const appError = handleApiError(error);
    return rejectWithValue(appError.message);
  }
});
export const GoogleLoginlogin = createAsyncThunk<
  ILoginResponse,
  {token: string},
  { rejectValue: string }
>("auth/google-login", async (data, { rejectWithValue }) => {
  try {
    const { data: res } = await AuthAPI.Googlelogin(data);
    return {
      accessToken: res!.accessToken,
    };
  } catch (error) {
    const appError = handleApiError(error);
    return rejectWithValue(appError.message);
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data: _res } = await AuthAPI.logout();
    } catch (error) {
      const appError = handleApiError(error);
      return rejectWithValue(appError.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isAuthLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { accessToken } = action.payload;
        state.accessToken = accessToken;
        state.isAuthLoading = false;
      })
      .addCase(login.rejected, (state, _action) => {
        state.isAuthLoading = false;
      })
      .addCase(GoogleLoginlogin.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(GoogleLoginlogin.fulfilled, (state, action) => {
        const { accessToken } = action.payload;
        state.accessToken = accessToken;
        state.isAuthLoading = false;
      })
      .addCase(GoogleLoginlogin.rejected, (state, _action) => {
        state.isAuthLoading = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.isAuthLoading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthLoading = false;
      });
  },
});

export const { setAccessToken, setAuthLoading } = authSlice.actions;
const authReducer = authSlice.reducer;

export default authReducer;