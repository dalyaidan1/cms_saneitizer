import React, { useState } from "react"
import MenuIcon from '@mui/icons-material/Menu';
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

function Nav(){
    return (
        <nav>
            <ul>                                  
                <li>
                    <img src={`images/cmss_proto_long_notext_transp.png`} /> 
                    <span>CMS San(e)itizer</span>  
                    <MenuIcon/>                      
                </li>
                <li>
                    <span>Setup</span>
                    <CircleIcon />                               
                </li>  
                <li>
                    <span>Run</span>
                    <CircleOutlinedIcon />                               
                </li>  
                <li>
                    <span>Adjust</span>
                    <CircleOutlinedIcon />                               
                </li> 
                <li>
                    <span>Export</span>
                    <CircleOutlinedIcon />                               
                </li>  
            </ul>
        </nav>
    )
}

export default Nav