import React, {useState} from 'react'
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';


function Adjust(props){
    return(
        <>
            <section id='navCode'
                dangerouslySetInnerHTML={{__html: props.nav}}>
            </section>
            <button 
                onClick={(e) => {
                    e.preventDefault()
                    props.Export()
                }}>
                Next <DoubleArrowOutlinedIcon/>
            </button>
        </>
    )
}

export default Adjust