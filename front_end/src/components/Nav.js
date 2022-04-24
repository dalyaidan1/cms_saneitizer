import React, { useState, useEffect } from "react"
import MenuIcon from '@mui/icons-material/Menu';
import FilledCircleConnector from "./icons/FilledCircleConnector";
import HollowCircleConnector from "./icons/HollowCircleConnector";

function Nav(props){
    const [fill, setFill] = useState(props.fill)

    useEffect(() => {
        if (props.fill !== fill){
            setFill(props.fill)
        }   
    })

    return (
        <nav>
            <ul>                                  
                <li>
                    <img src={`images/logo.svg`} /> 
                    <span>CMS San(e)itizer</span>  
                    {/* <MenuIcon/>                       */}
                </li>
                <li>
                    <span>Setup</span>
                    {fill.configForm 
                        ? <FilledCircleConnector />
                        : <HollowCircleConnector />}                              
                </li>  
                <li>
                    <span>Run</span>
                    {fill.appRunning
                        ? <FilledCircleConnector />
                        : <HollowCircleConnector />}                            
                </li>  
                <li>
                    <span>Adjust</span>
                    {fill.adjustments
                        ? <FilledCircleConnector />
                        : <HollowCircleConnector />}                              
                </li> 
                <li>
                    <span>Export</span>
                    {fill.export 
                        ? <FilledCircleConnector />
                        : <HollowCircleConnector />}
                </li>  
            </ul>
        </nav>
    )
}

export default Nav