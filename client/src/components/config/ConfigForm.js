import React, {useState, useEffect, Fragment} from 'react'
import ArrayEmulator from './ArrayEmulator'
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';

function ConfigForm(props){
    const [config, setConfig] = useState({
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

    function submit(){
        this.props.submit
    }

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

            <legend>RESTful Detection Config</legend>
            
            <label htmlFor={"DETECT_NON_RESTFUL"}>
                <input 
                    type='checkbox'
                    name={"DETECT_NON_RESTFUL"}
                    defaultChecked={config.DETECT_NON_RESTFUL}
                    onChange={(e) => {
                        config.DETECT_NON_RESTFUL= e.target.checked
                        setConfig({...config})
                    }} />
                Detect Non-restful changes</label>            

            {config.DETECT_NON_RESTFUL 
            && <>
            <fieldset className='attributes'>
                <legend className='semanticVisible'>Attributes</legend>
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
                <legend>Elements to Ignore</legend>
                <ArrayEmulator 
                    outputArray={elementsToIgnore}
                    setOutputArray={setElementsToIgnore} />
            </fieldset>

            <label htmlFor={"TOLERANCE"}>Tolerance</label>
            <input 
                type='number'
                min='0'
                name={"TOLERANCE"}
                defaultValue={config.TOLERANCE}
                onChange={(e) => {
                    config.TOLERANCE= parseInt(e.target.value)
                    setConfig({...config})
                }} />

            <label htmlFor={"RADIUS"}>Radius</label>
            <input 
                type='number'
                min='0'
                name={"RADIUS"}
                defaultValue={config.RADIUS}
                onChange={(e) => {
                    config.RADIUS= parseInt(e.target.value)
                    setConfig({...config})
                }} />
                </> }

            <button type="submit"
                value="Next"
                onClick={(e) => {
                    e.preventDefault()
                    props.submit()
                }}>
                Next <DoubleArrowOutlinedIcon/>
            </button>
            
        </form>
    )

}

export default ConfigForm