import { Provider } from "react-redux";
import AppRouter from "./AppRouter";
import { store } from "./config/redux/store/store";

const App = () => {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
};

export default App;