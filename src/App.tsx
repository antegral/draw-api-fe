import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import Notepad from "./notepad";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Notepad />
      </ThemeProvider>
    </>
  );
}

export default App;
