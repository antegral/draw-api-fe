import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import Notepad from "./notepad";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Notepad />
        <Toaster />
      </ThemeProvider>
    </>
  );
}

export default App;
