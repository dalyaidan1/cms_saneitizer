import React, {useState, useEffect} from 'react'

function Run(props){
    const [loadImage, setLoadImage] = useState(1)
    const [load, setLoad] = useState(false)

    useEffect(() => {
        if (load === true){
           startLoader()
        }
    })

    function startLoader(){
        const newIntv = setInterval(() => {
            if (loadImage < 3){
                setLoadImage(loadImage+1)
            } else {
                setLoadImage(1)
            } 
            if (load){
                clearInterval(newIntv)
            }
        }, 1000)
        newIntv
    }

    
    return(
        <form>
            <legend>
                Run
            </legend>
            <button 
                onClick={(e) => {
                    e.preventDefault()
                props.startApp()
                setLoad(true)
                }}>
            Start App
            </button>
            {load 
            && <>
                <div className='loader'>
                <img src={`images/loader/frame${loadImage}.png`} alt='loader'/>
                    <h1>San(e)itizing Website...</h1>
                </div>
            </>}
            
        </form>
    )
}

export default Run