import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { UserContextProvider } from "./context/UserContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <UserContextProvider>
    <App />
  </UserContextProvider>,
)
