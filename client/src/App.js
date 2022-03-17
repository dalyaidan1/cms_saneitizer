import './App.css';

async function startApp(){
  console.log("sadhkasjdhkaj")
  await fetch(`${process.env.REACT_APP_BACKEND_URL}/start`, {
    method:'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({start:true})
  })
  .then((res) => {
    console.log("goog")
  })
  .catch(err => {
    console.log(err)
  })
}


function App() {
  return (
    <section>
        <button 
          onClick={() => {
            startApp()
          }}>
            Start App
          </button>
          <p>{process.env.REACT_APP_BACKEND_URL}</p>
    </section>
  );
}

export default App;
