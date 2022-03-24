import { useState, useEffect } from 'react';
import { postData, getFileData } from './fetch';
import ConfigForm from './components/config/ConfigForm'
import Nav from './components/Nav'
import Run from './components/run/Run'
import Adjust from './components/edit/Adjust';
import Export from './components/export/Export';


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
  const [data, setData] = useState('')

  async function startApp(){
    let data = {...config, start:true}
    let res = await postData('start', data)
    setNav(res.data)
  }

  useEffect(() => {
    if (nav !== "" && view.adjustments !== true && view.export === false){
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

  async function getZip(){
    let data = await getFileData('export/nav')
    let url = window.URL.createObjectURL(data)
    setData(url)
    window.document.getElementById('data').click()
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
            toExport={() => updateView("export")} 
            nav={nav} /> 
        }

      {view.export 
        && <Export 
            getZip={() => getZip()}
            data={data} /> 
        }
    </main>
    </>
  )
}

export default App;
