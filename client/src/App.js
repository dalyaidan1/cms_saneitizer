import { useState, useEffect } from 'react';
import { postData } from './fetch';
import ConfigForm from './components/config/ConfigForm'
import Nav from './components/Nav'
import Run from './components/run/Run'
import Adjust from './components/edit/Adjust';


const initialView = {
  configForm: true,
  appRunning: false,
  adjustments : false,
  export: false,
}

function App() {
  const [config, setConfig] = useState({})
  const [nav, setNav] = useState("")
  const [navFill, setNavFill] = useState(initialView)
  const [view, setView] = useState(initialView)

  async function startApp(){
    let data = {...config, start:true}
    console.log(data)
    let res = await postData('start', data)
    setNav(res.data)
  }

  useEffect(() => {
    if (nav !== "" && view.adjustments !== true){
      updateView("adjustments")
    }
  },)

  function updateView(viewNameToUpdate){
    navFill[viewNameToUpdate] = true
    setNavFill({...navFill})
    for (let viewName of Object.keys(view)){
      view[viewName] = false
    }
    view[viewNameToUpdate] = true
    setView({...view})
  }

  return (
    <>
    <Nav 
      fill={navFill} />
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

        {view.adjustments 
        && <Adjust 
            // export={} 
            nav={nav} /> 
        }

    </main>
    </>
  )
}

export default App;
