import './App.css';
import Header from './components/Header.js'
import ConversionTab from './components/ConversionTab.js'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header></Header>
        <p>
            This application is intended for educational purposes only. Please respect copyright laws
            and avoid using this application in ways that violate intellectual property rights.
          </p>
        <ConversionTab></ConversionTab>
      </header>
    </div>
  );
}

export default App;
