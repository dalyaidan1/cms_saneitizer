import React, { useState, useEffect, Fragment } from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function ArrayEmulator(props){   

    const initialState = [
        (<Fragment key={0}>
            <label 
                className='semanticVisible'
                htmlFor={`${props.name}Input0`}>{props.name}</label>
            <input 
                type="text"
                name={`${props.name}Input0`}
                placeholder='myValue1'
                key={0}
                data-id="0"
                defaultValue={props.outputArray[0]}
                disabled={props.disabled}
                onChange={(e) => {
                    props.outputArray[0] = e.target.value
                    props.setOutputArray([...props.outputArray])
                }} />
        </Fragment>)
    ]

    useEffect(() => {
        setInputs(initialState)
    }, [props.disabled])

    const [inputs, setInputs] = useState(initialState)

    function addInput(){
        let newDataID = inputs.length
        inputs[newDataID] = (
            <Fragment key={newDataID}>
                <label 
                    className='semanticVisible'
                    htmlFor={`${props.name}Input${newDataID}`}>{props.name}</label>
                <input 
                    type="text"
                    name={`${props.name}Input${newDataID}`}
                    key={newDataID}
                    data-id={newDataID}
                    placeholder={`myValue${newDataID+1}`}
                    defaultValue={props.outputArray[newDataID]}
                    disabled={props.disabled}
                    onChange={(e) => {
                        props.outputArray[newDataID] = e.target.value
                        props.setOutputArray([...props.outputArray])
                    }} />
            </Fragment>
        )
        setInputs([...inputs])
    }

    function removeInput(){
        // remove internally
        inputs.pop()
        setInputs([...inputs])

        // remove externally
        props.outputArray.pop()
        props.setOutputArray([...props.outputArray])
    }
    

    return (
        <fieldset className='arrayEmulator'>
            {inputs}

            <fieldset>
                <button
                    disabled={props.disabled}
                    onClick={(e) => {
                        e.preventDefault()
                        addInput()
                    }} >
                    <AddCircleOutlineIcon /> 
                </button>
                {inputs.length > 1 
                && <button
                onClick={(e) => {
                    e.preventDefault()
                    removeInput()
                }} >
                    <RemoveCircleOutlineIcon /> 
                </button> }
            </fieldset>
            
        </fieldset>
    )
}

export default ArrayEmulator