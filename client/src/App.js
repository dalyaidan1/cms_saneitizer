import { useState } from 'react';
import { postData } from './fetch';
import ConfigForm from './components/config/ConfigForm'
import Nav from './components/Nav'
import Run from './components/run/Run'

async function startApp(){
  let data = {start:true}
  await postData('start', data)
}

function App() {
  const [config, setConfig] = useState({})
  const [view, setView] = useState({
    configForm: true,
    startApp : false,
    appRunning: false,
    adjustments : false,
    export: false,
  })

  function updateView(viewNameToUpdate){
    for (let viewName of Object.keys(view)){
      view[viewName] = false
    }
    view[viewNameToUpdate] = true
    setView({...view})
  }

  return (
    <>
    <Nav />
    <main>          
        {view.configForm 
        && <ConfigForm 
              submit={() => {
                setConfig()
                updateView("startApp")
                }} /> }    
        
        {view.startApp 
        && <Run 
            startApp={startApp} /> 
        }
    </main>
    </>
  )
}

export default App;
