import React, {useState, useEffect} from 'react'

function ConfigForm(){
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

    useEffect(() => {
        mapNodeProps()
      }, [])

    const mapNodeProps = () => {
        let newElements = []
        const allAttributes = Object.keys(config.ATTRIBUTES)
        for (let attribute of allAttributes){
            newElements.push(
                <>
                    <label for={`${attribute}Attributes`}>{attribute}</label>
                    <input 
                        type='checkbox' 
                        name={`${attribute}Attributes`}
                        checked={config.ATTRIBUTES[attribute].check}
                        onChange={(e) => {
                            config.ATTRIBUTES[attribute].check = e.target.checked
                            setConfig({...config})
                        }}/>
                    {/* TODO: make a new comp for mimicking an array*/}
                </>
            )
        }
        setNodePropElements(newElements)
    }    

    return (
        <form>
            <legend>Scraping Config</legend>
            
            <label htmlFor={config.DETECT_NON_RESTFUL}>Detect Non-restful changes</label>
            <input 
                type='checkbox'
                name={config.DETECT_NON_RESTFUL}
                checked={config.DETECT_NON_RESTFUL}
                onChange={(e) => {
                    config.DETECT_NON_RESTFUL= e.target.checked
                    setConfig({...config})
                }}
                 />

            <fieldset>
                <legend>Attributes</legend>
                {nodePropElements}
            </fieldset>
            
        </form>
    )

}

export default ConfigForm