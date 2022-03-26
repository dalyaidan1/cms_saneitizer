import React from 'react'
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';

function Export(props){
    return(
        <section className='export'>
            <h1>Export</h1>
            <p>Your files will be exported into separate pages and directories, 
                and a navigation.html file that contains the navigation seen in adjustments. 
                This will then be zipped and sent.</p>
            <p>To import into another CMS, simply upload the file structure 
                and insert navigation.html with the appropriate file (eg. WordPress header.php), 
                or use the HTML files as is.</p>
            <button
                onClick={() => props.getZip()} >
                <DownloadForOfflineIcon />
                <span>Download</span>
            </button>
            <a href={props.data} id="data" download></a>
        </section>
    )
}

export default Export