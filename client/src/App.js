import { useState } from 'react';
import { postData } from './fetch';
import ConfigForm from './components/config/ConfigForm'
import Nav from './components/Nav'
import Run from './components/run/Run'

function App() {
  const [config, setConfig] = useState({})
  const [view, setView] = useState({
    configForm: true,
    appRunning: false,
    adjustments : false,
    export: false,
  })

  async function startApp(){
    let data = {...config, start:true}
    console.log(data)
    let res = await postData('start', data)
    console.log(res)
  }

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
              submit={(config) => {
                setConfig(config)
                updateView("appRunning")
                }} /> }    
        
        {view.appRunning 
        && <Run 
            startApp={startApp} 
            toAdjust={() => updateView("adjustments")} /> 
        }
    </main>
    </>
  )
}

export default App;
