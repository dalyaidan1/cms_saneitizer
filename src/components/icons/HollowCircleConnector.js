import React from 'react'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

function HollowCircleConnector(){
    return(
        <div className="circleConnector">
            <span>|</span>
            <CircleOutlinedIcon />
            <span>|</span>
        </div>
    )
}

export default HollowCircleConnector