import "./App.css";
import AppManager from "./AppManager"; // Importamos el nuevo componente

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Editor de Archivos JSON</h1>
      </header>
      <main>
        <AppManager />
      </main>
    </div>
  );
}

export default App;
