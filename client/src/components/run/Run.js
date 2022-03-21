import React, {useState, useEffect} from 'react'
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';

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
            <button 
                onClick={(e) => {
                    e.preventDefault()
                // props.startApp()
                setLoad(true)
                }}>
            Start App
            </button>
            {load 
            && <>
                <section className='loader'>
                <img src={`images/loader/frame${loadImage}.png`} alt='loader'/>
                    <h1>San(e)itizing Website...</h1>
                </section>
            </>}

            <button 
                    onClick={(e) => {
                        e.preventDefault()
                        setLoad(false)
                    // props.adjust()
                    }}>
                    Next <DoubleArrowOutlinedIcon/>
            </button>
            
        </form>
    )
}

export default Run