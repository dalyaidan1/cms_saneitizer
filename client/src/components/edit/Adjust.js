import React, {useState} from 'react'
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';


function Adjust(props){
    return(
        <section>
            <h1>Adjust</h1>
            <article id='navCode'
                dangerouslySetInnerHTML={{__html: props.nav}}>
            </article>
            <button 
                onClick={(e) => {
                    e.preventDefault()
                    props.toExport()
                }}>
                Next <DoubleArrowOutlinedIcon/>
            </button>
        </section>
    )
}

export default Adjust