import React, { useState } from "react"
import MenuIcon from '@mui/icons-material/Menu';

function Nav(){
    return (
        <nav>
            <ul>
                <li><MenuIcon/></li>
                <li>CMS San(e)itizer</li>
            </ul>
        </nav>
    )
}

export default Nav