const axios = require('axios');

exports.clienteAxios = axios.create({
    baseURL: process.env.BASE_SAP_API
});
