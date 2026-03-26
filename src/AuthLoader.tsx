import { useEffect } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { setAccessToken, setAuthLoading } from "./config/redux/slice/authSlice";
import { useRefreshQuery } from "./querycontrollers/refresh.queries";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./config/redux/reducers/rootReducer";
import Loader from "./components/Loader";

const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { isAuthLoading, accessToken } = useSelector((state:RootState) => state.auth);

  const { data } = useRefreshQuery();
  const isFetchingMe = useIsFetching({ queryKey: ["me"] }) > 0;

  useEffect(() => {
    if (isFetchingMe) {
      dispatch(setAuthLoading(true));
    } else {
      dispatch(setAuthLoading(false));
      if (data) {
        dispatch(setAccessToken(data?.data?.accessToken ?? ""));
      }
    }
  }, [isFetchingMe, dispatch, data]);

  if (isAuthLoading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default AuthLoader;