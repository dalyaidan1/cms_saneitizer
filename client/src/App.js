import './App.css';
import { postData } from './fetch';

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
    </section>
  );
}

export default App;
