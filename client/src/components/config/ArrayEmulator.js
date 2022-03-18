import React, { useState, Fragment } from "react";
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function ArrayEmulator(props){   
    const [inputs, setInputs] = useState([
        (<Fragment key={0}>
            <label htmlFor={`${props.name}Input0`}>{props.name}</label>
            <input 
                type="text"
                name={`${props.name}Input0`}
                key={0}
                data-id="0"
                onChange={(e) => {
                    props.outputArray[0] = e.target.value
                    props.setOutputArray([...props.outputArray])
                }} />
        </Fragment>)
    ])

    function addInput(){
        let newDataID = inputs.length
        inputs[newDataID] = (
            <Fragment key={newDataID}>
                <label htmlFor={`${props.name}Input${newDataID}`}>{props.name}</label>
                <input 
                    type="text"
                    name={`${props.name}Input${newDataID}`}
                    key={newDataID}
                    data-id={newDataID}
                    onChange={(e) => {
                        props.outputArray[newDataID] = e.target.value
                        props.setOutputArray([...props.outputArray])
                    }} />
            </Fragment>
        )
        setInputs([...inputs])
    }
    

    return (
        <>
            {inputs}
            <button
               onClick={(e) => {
                e.preventDefault()
                addInput()
               }} > +
                   {/* <AddCircleOutlineIcon />  */}
                </button>
        </>
    )
}

export default ArrayEmulator