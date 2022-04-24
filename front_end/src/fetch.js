export const getData = async (endpoint) => {
    return await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}`, {
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
      .then((res) => res.json())
      .then(data => {
        return data
      })
      .catch((err) => {
        return err
      })
}
export const getFileData = async (endpoint) => {
  return await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}`, {
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
    .then((res) => res.blob())
    .then(data => {
      return data
    })
    .catch((err) => {
      return err
    })
}

export const postData = async (endpoint, data) => {
    return await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}`, {
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
      .then((res) => res.json())
      .then(data => {
        return data
      })
      .catch((err) => {
        return err
      })
}