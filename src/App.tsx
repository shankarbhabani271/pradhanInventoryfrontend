import { Provider } from "react-redux";
import AppRouter from "./AppRouter";
import { store } from "./config/redux/store/store";


const App = () => {

  return <AppRouter />
};

export default App; // ✅ MUST BE HERE