import axios from 'axios'

const clientAxios = axios.create({
    baseURL: process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_BACKEND_URL_LOCAL : process.env.REACT_APP_BACKEND_URL_REMOTO
})

// process.env.REACT_APP_BACKEND_URL_REMOTO

export default clientAxios