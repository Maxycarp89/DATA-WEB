const {clienteAxios} = require('../utils/client.Axios')

require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"


exports.ClientPartners = async (req, res) => {

    const cookies = req.header('Authorization')
    const { dni = "", codCliente = "" } = req.query

    let clientData = {}
    
    const urlParams = decodeURI(!!dni ? `FederalTaxID eq '${dni}'` : !!codCliente ? `CardCode eq '${codCliente}'` : '')

    try {

        const resultClient = await clienteAxios.get("/b1s/v2/BusinessPartners?$filter=" + urlParams, {
            headers: {
                Cookie: `${cookies}`
            }
        })
        if (resultClient.data.value.length === 0) {
            const clientExist = await clienteAxios.get("/b1s/v1/$filter=" + decodeURI(`FederalTaxID eq '${dni}' and CardType eq 'cCustomer'`), {
                headers: {
                    Cookie: `${cookies}`
                }
            })
            if (clientExist.data.value.length > 0) {
                const { CardCode, CardName, Cellular,Address, E_Mail, FederalTaxID, ZipCode, City } = clientExist.data.value[0] 
                clientData = { CardCode, CardName, Cellular,Address, E_Mail, FederalTaxID,ZipCode,City }
                // get vehicles with services that they are not from yuhmak
                services = await serviceControllers.ServiceCalls({ body: { CardCode, cookies } })
            } else {
                res.status(404).send({ message: 'No existe ningún cliente con el DNI ingresado' })
            }
        } else {
            const { CardCode, CardName, Cellular,Address, E_Mail,ZipCode,City, LicTradNum } = resultClient.data.value[0]
            clientData = { CardCode, CardName,Address, Cellular, E_Mail,ZipCode,City, FederalTaxID: LicTradNum }
            motorBikes = resultClient.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
            bikes = resultClient.data.value.filter(bikes => bikes.ItemCode.startsWith("E") && bikes.U_Division == "DB")
            console.log('motorBikes', motorBikes)
            // get vehicles with services that they are not from yuhmak
            services = await serviceControllers.ServiceCalls({ body: { CardCode, cookies } })
        }
        res.send({ motorBikes, bikes, businessData, services,  })

    } catch (error) {
        console.log('AQUI')
        const { response } = error
        console.log(error)
        if (response.data.error.code && response.data.error.code === 301) {
            res.status(response.data.error.code).send({ message: response.data.error.message && response.data.error.message.value })
        } else {
            res.status(response.status).send({ error: response.data.error.message && response.data.error.message.value, code: response.data.error.code && response.data.error.code, errorMessage: 'Ocurrió un error, por favor vuelve a intenter' })
        }
    }


    
}


