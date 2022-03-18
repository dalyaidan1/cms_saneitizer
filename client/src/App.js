import './App.css';
import { postData } from './fetch';
import ConfigForm from './components/config/ConfigForm'

async function startApp(){
  let data = {start:true}
  await postData('start', data)
}


function App() {
  return (
    <section>
        <button 
          onClick={() => {
            startApp()
          }}>
            Start App
          </button>
          <ConfigForm />
    </section>
  );
}

export default App;
