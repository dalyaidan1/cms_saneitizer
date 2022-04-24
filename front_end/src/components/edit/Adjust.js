import React, {useState, useEffect} from 'react'
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { postData } from '../../fetch';



function Adjust(props){
    const [propNav, setPropNav] = useState(props.nav)
    const [viewState, setViewState] = useState(true)

    function setView(name){
        let view = document.getElementById('view').children[1]
        let props = JSON.parse((name.replace(/'/g, '"')))
        view.dataset.id = props.id
        
        if (props.type === "Page"){
            if (props.shift_page){
                view.innerHTML = `
                <p><b>Type</b>: ${props.type} - Shift</p>
                <p><b>Title</b>: ${props.title}</p>
                <hr/>
                <p><b>URL</b>: ${props.pre_shift_url}</p>
                <hr/>
                <p><b>Layer</b>: ${props.layer}</p>
                <label>Change Title <label/>
                <input type="text" id="newTitle" />
                <input type="submit" value="Change" onclick='
                    window.updateTitle(this)' />
                <a href="${props.pre_shift_url}" target="_blank">View Original Page
                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root" 
                    focusable="false" 
                    aria-hidden="true"
                    viewBox="0 0 24 24" data-testid="DoubleArrowOutlinedIcon">
                    <path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path>
                    <path d="M8.5 5H4l5 7-5 7h4.5l5-7z"></path>
                </svg>
                </a>
                `
            } else {
                view.innerHTML = `
                <p><b>Type</b>: ${props.type}</p>
                <p><b>Title</b>: ${props.title}</p>
                <hr/>
                <p><b>URL</b>: ${props.url}</p>
                <hr/>
                <p><b>Layer</b>: ${props.layer}</p>
                <label>Change Title <label/>
                <input type="text" id="newTitle" />
                <input type="submit" value="Change" onclick='
                    window.updateTitle(this)' />
                <a href="${props.url}" target="_blank">View Original Page
                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root" 
                    focusable="false" 
                    aria-hidden="true"
                    viewBox="0 0 24 24" data-testid="DoubleArrowOutlinedIcon">
                    <path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path>
                    <path d="M8.5 5H4l5 7-5 7h4.5l5-7z"></path>
                </svg>
                </a>                
                `
            }
        } else {
            view.innerHTML = `                
            <p><b>Type</b>: ${props.type}</p>
            <p><b>Path</b>: ${props.name}</p>
            <hr/>
            <p><b>Layer</b>: ${props.layer}</p>
            `
        }
    }

    async function updateTitle(target){
        let newTitle = target.previousElementSibling.value
        let newData = {"id": target.parentElement.parentElement.parentElement.dataset.id, "title": newTitle}
        await postData('adjust-node', newData)
        let viewTitle = document.querySelector('#view div:nth-child(2) p:nth-child(2)')
        viewTitle.innerHTML = `<b>Title</b>: ${newTitle}`
        return
    }

    useEffect(async () => {
        // attach functions that will call on from the DOM to pass through window to reach the VDOM
        window.setView = (name) => setView(name)
        window.updateTitle = async (target) => await updateTitle(target)
        
      }, []);
    

    return(
        <>
            <section className='adjuster'>
                <h1>Adjust</h1>
                <article id='navCode'
                    dangerouslySetInnerHTML={{__html: propNav}}>
                </article>

                <aside id='view'>
                <h1 onClick={() => setViewState(!viewState) }
                    >Selected Properties {viewState ? <ExpandMoreIcon/> : <ExpandLessIcon/>} </h1>
                    <div style={{display:viewState ? "block" : "none"}}></div>
                </aside>

                <button 
                    onClick={(e) => {
                        e.preventDefault()
                        props.toExport()
                    }}>
                    Next <DoubleArrowOutlinedIcon/>
                </button>
            </section>            
        </>
    )
}

export default Adjust