import React, {useState, useEffect, Fragment} from 'react'
import ArrayEmulator from './ArrayEmulator'
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';

function ConfigForm(props){
    const [config, setConfig] = useState({
        DOMAIN:"",
        DRAW_PAGE_TITLE_FROM : {
            pageTitle : true,
            urlSnippet : false
        },
        DETECT_NON_RESTFUL : true,
        ATTRIBUTES: {
            animationend: {
                check: false,
                ignoreWhenContaining: []
            },
            change: {
                check: true,
                ignoreWhenContaining: []
            },
            class: {
                check: false,
                ignoreWhenContaining: []
                },
            click: {
                check: true,
                ignoreWhenContaining: []
            },
            dblclick: {
                check: true,
                ignoreWhenContaining: []
            },
            drop: {
                check: false,
                ignoreWhenContaining: []
            },
            ended: {
                check: false,
                ignoreWhenContaining: []
            },
            error: {
                check: false,
                ignoreWhenContaining: []
            },
            focus: {
                check: false,
                ignoreWhenContaining: []
            },
            focusin: {
                check: false,
                ignoreWhenContaining: []
            },
            focusout: {
                check: false,
                ignoreWhenContaining: []
            },
            fullscreenchange: {
                check: false,
                ignoreWhenContaining: []
            },
            fullscreenerror: {
                check: false,
                ignoreWhenContaining: []
            },
            hashchange: {
                check: false,
                ignoreWhenContaining: []
            },
            id: {
                check: false,
                ignoreWhenContaining: []
                },
            input: {
                check: true,
                ignoreWhenContaining: []
            },
            invalid: {
                check: false,
                ignoreWhenContaining: []
            },
            keypress: {
                check: false,
                ignoreWhenContaining: []
            },
            keyup: {
                check: false,
                ignoreWhenContaining: []
            },
            load: {
                check: false,
                ignoreWhenContaining: []
            },
            loadstart: {
                check: false,
                ignoreWhenContaining: []
            },
            message: {
                check: false,
                ignoreWhenContaining: []
            },
            mousedown: {
                check: false,
                ignoreWhenContaining: []
            },
            mouseenter: {
                check: false,
                ignoreWhenContaining: []
            },
            mouseleave: {
                check: false,
                ignoreWhenContaining: []
            },
            mousemove: {
                check: false,
                ignoreWhenContaining: []
            },
            mouseover: {
                check: false,
                ignoreWhenContaining: []
            },
            mouseout: {
                check: false,
                ignoreWhenContaining: []
            },
            mouseup: {
                check: false,
                ignoreWhenContaining: []
            },
            mousewheel: {
                check: false,
                ignoreWhenContaining: []
            },
            pageshow: {
                check: false,
                ignoreWhenContaining: []
            },
            play: {
                check: false,
                ignoreWhenContaining: []
            },
            popstate: {
                check: false,
                ignoreWhenContaining: []
            },
            select: {
                check: true,
                ignoreWhenContaining: []
            },
            show: {
                check: true,
                ignoreWhenContaining: []
            },
            submit: {
                check: false,
                ignoreWhenContaining: []
            },
            toggle: {
                check: true,
                ignoreWhenContaining: []
            },
            touchcancel: {
                check: false,
                ignoreWhenContaining: []
            },
            touchend: {
                check: false,
                ignoreWhenContaining: []
            },
            touchmove: {
                check: false,
                ignoreWhenContaining: []
            },
            touchstart: {
                check: false,
                ignoreWhenContaining: []
            },
            transitionend: {
                check: false,
                ignoreWhenContaining: []
            },
            wheel: {
                check: false,
                ignoreWhenContaining: []
            }
        },
        IGNORABLE_ELEMENTS : [],
        TOLERANCE : 50,
        RADIUS : 0,
    })

    const [nodePropElements, setNodePropElements] = useState([])

    const [elementsToIgnore, setElementsToIgnore] = useState([])

    useEffect(() => {
        mapNodeProps()
      }, [])

    const mapNodeProps = () => {
        let newElements = []
        const allAttributes = Object.keys(config.ATTRIBUTES)
        for (let attribute of allAttributes){
            newElements.push(
                <tr
                    key={newElements.length}>
                    <td>
                        <label htmlFor={`${attribute}Attributes`}>{attribute}</label>
                    </td>
                    <td>
                        <input 
                            type='checkbox' 
                            name={`${attribute}Attributes`}                        
                            defaultChecked={config.ATTRIBUTES[attribute].check}
                            onChange={(e) => {
                                config.ATTRIBUTES[attribute].check = e.target.checked
                                setConfig({...config})
                                mapNodeProps()
                            }}/>
                    </td>
                    <td>
                        <ArrayEmulator 
                            outputArray={config.ATTRIBUTES[attribute].ignoreWhenContaining}
                            setOutputArray={(data) => {
                                config.ATTRIBUTES[attribute].ignoreWhenContaining = data
                                setConfig({...config})}}
                            disabled={!(config.ATTRIBUTES[attribute].check)} />
                    </td>
                    
                </tr> 
            )
        }
        setNodePropElements(newElements)
    }

    return (
        <form className='configForm' >

            <legend>Setup</legend>

            <label htmlFor={"DOMAIN"}><span>* </span>Domain Name</label>
            <input 
                type='text'
                name={"DOMAIN"}
                placeholder='https://www.domain.com'
                onChange={(e) => {
                    config.DOMAIN= e.target.value
                    setConfig({...config})
                }} 
                required={true} />

            <fieldset>
                <legend>Draw page titles from</legend>
                <div>
                    <input 
                        type='radio'
                        name='pageTitles'
                        id='pageTitle'
                        defaultChecked={config.DRAW_PAGE_TITLE_FROM.pageTitle}
                        value='pageTitleTag' 
                        onChange={(e) => {
                            config.DRAW_PAGE_TITLE_FROM.pageTitle= e.target.checked ? true : false
                            setConfig({...config})
                        }} />
                    <label htmlFor='pageTitle'>                
                        Page <code>&lt;title&gt;</code> tag
                    </label>
                </div>
                <div>
                    <input 
                        type='radio'
                        name='pageTitles'
                        id='URL'
                        defaultChecked={config.DRAW_PAGE_TITLE_FROM.urlSnippet}
                        value='URLsnippet' 
                        onChange={(e) => {
                            config.DRAW_PAGE_TITLE_FROM.urlSnippet= e.target.checked ? true : false
                            setConfig({...config})
                        }} />
                    <label htmlFor='URL'>
                        URL snippet (last part of a URL to its last "/")
                    </label>
                </div>
            </fieldset>
            
            <label htmlFor={"DETECT_NON_RESTFUL"}>
                <input 
                    type='checkbox'
                    name={"DETECT_NON_RESTFUL"}
                    defaultChecked={config.DETECT_NON_RESTFUL}
                    onChange={(e) => {
                        config.DETECT_NON_RESTFUL= e.target.checked
                        setConfig({...config})
                    }} />
                Detect non-restful changes</label>            

            {config.DETECT_NON_RESTFUL 
            && <>
            <fieldset className='attributes'>
                <legend className='semanticVisible'>Attributes</legend>
                <dfn>When detecting changes on each page, attributes that are checked will be checked for events. 
                    If a value is inside ignore, the elements event will be ignored when containing that value</dfn>
                <table>
                    <thead>
                        <tr>
                            <th>Attributes</th>
                            <th>Check</th>
                            <th>Ignore when Containing</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nodePropElements}
                    </tbody>
                </table>
            </fieldset>
            
            <fieldset>
                <legend>Elements to ignore</legend>
                <dfn>Format: ALL CAPS, no special characters and one tag per field. Eg. DIV</dfn>
                <ArrayEmulator 
                    outputArray={elementsToIgnore}
                    setOutputArray={setElementsToIgnore} />
            </fieldset>

            <label htmlFor={"RADIUS"}>Radius</label>
            <dfn>When an event is initiated, how many elements away (ancestors) should be checked</dfn>
            <input 
                type='number'
                min='0'
                name={"RADIUS"}
                defaultValue={config.RADIUS}
                onChange={(e) => {
                    config.RADIUS= parseInt(e.target.value)
                    setConfig({...config})
                }} />

            <label htmlFor={"TOLERANCE"}>Tolerance</label>
            <dfn>When an event is initiated, how many elements (ancestors) changing qualifies a new page</dfn>
            <input 
                type='number'
                min='0'
                name={"TOLERANCE"}
                defaultValue={config.TOLERANCE}
                onChange={(e) => {
                    config.TOLERANCE= parseInt(e.target.value)
                    setConfig({...config})
                }} />

                </> }

            <button type="submit"
                value="Next"
                onClick={(e) => {
                    e.preventDefault()
                    props.submit(config)
                }}>
                Next <DoubleArrowOutlinedIcon/>
            </button>
            
        </form>
    )

}

export default ConfigForm