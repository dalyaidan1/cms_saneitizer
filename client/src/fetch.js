export const getData = async (endpoint) => {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}`, {
        method:'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      })
      .then((res) => {
        return json.parse(res)
      })
      .catch((err) => {
        return err
      })
}

export const postData = async (endpoint, data) => {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}`, {
        method:'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({data})
      })
      .then((res) => {
        return json.parse(res)
      })
      .catch((err) => {
        return err
      })
}