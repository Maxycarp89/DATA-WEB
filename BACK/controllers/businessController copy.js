const { clienteAxios } = require('../utils/clientAxios')
const serviceControllers = require('./serviceControllers')
const getCustomersProductsControllers = require('./getCustomersProductsControllers')

require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

function removeDuplicates(arr) {
    let s = new Set(arr)
    let it = s.values()
    return Array.from(it)
}

const removeInitialOR = new RegExp(/or\s/)
const pat = /M\d{10}/

exports.BusinessPartners = async (req, res) => {

    const cookies = req.header('Authorization')
    const { dni = "", codCliente = "" } = req.query

    let businessData = {}
    let motorBikes = []
    let bikes = []
    let services = []
    

    const urlParams = decodeURI(!!dni ? `LicTradNum eq '${dni}'` : !!codCliente ? `CardCode eq '${codCliente}'` : '')

    try {

        const resultClientAndProduct = await clienteAxios.get("/b1s/v1/sml.svc/YUH_CLIENTEYPRODASOCIADOS2?$filter=" + urlParams, {
            headers: {
                Cookie: `${cookies}`
            }
        })
        if (resultClientAndProduct.data.value.length === 0) {
            const clientExistBusiness = await clienteAxios.get("/b1s/v1/$filter=" + decodeURI(`FederalTaxID eq '${dni}' and CardType eq 'cCustomer'`), {
                headers: {
                    Cookie: `${cookies}`
                }
            })
            if (clientExistBusiness.data.value.length > 0) {
                const { CardCode, CardName, Cellular,Address, E_Mail, FederalTaxID, ZipCode, City } = clientExistBusiness.data.value[0] 
                businessData = { CardCode, CardName, Cellular,Address, E_Mail, FederalTaxID,ZipCode,City }
                // get vehicles with services that they are not from yuhmak
                services = await serviceControllers.ServiceCalls({ body: { CardCode, cookies } })
            } else {
                res.status(404).send({ message: 'No existe ningún cliente con el DNI ingresado' })
            }
        } else {
            const { CardCode, CardName, Cellular,Address, E_Mail,ZipCode,City, LicTradNum } = resultClientAndProduct.data.value[0]
            businessData = { CardCode, CardName,Address, Cellular, E_Mail,ZipCode,City, FederalTaxID: LicTradNum }
            motorBikes = resultClientAndProduct.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
            bikes = resultClientAndProduct.data.value.filter(bikes => bikes.ItemCode.startsWith("E") && bikes.U_Division == "DB")
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



exports.PatchBusinessPartnersCel = async (req, res) => {
    const cookies = req.header('Authorization');
    const { Cellular,Email, CardCode } = req.body
    try {
        await clienteAxios.patch(`/b1s/v1/BusinessPartners('${CardCode}')`, { Cellular: Cellular, Email: Email }, {
            headers: {
                Cookie: `${cookies}`
            }
        });
        res.send({ message: 'Celular / Email cambiada con Éxito' });
    } catch (error) {
        const { response } = error;
        console.log(response.data);
        if (response && response.data.error.code === 301) {
            res.status(response.data.error.code).send({ message: response.data.error.message.value });
        } else {
            res.status(response.status).send({ errorMessage: response.data.error.message.value, message: 'Ocurrió un error, por favor vuelve a intenter' });
        }
    }
}





/* Este código exporta una función llamada `PostBusinessPartners` que maneja una solicitud POST para
crear un nuevo socio comercial en una API externa. La función recibe un objeto de solicitud (`req`)
y un objeto de respuesta (`res`) como parámetros. */
exports.PostBusinessPartners = async (req, res) => {

    const cookies = req.header('Authorization')

    const { CardName, Cellular, EmailAddress, FederalTaxID, U_B1SYS_FiscIdType, Series, U_B1SYS_VATCtg, CardType } = req.body

    try {

        console.log('reqbody', req.body)
        const body = req.body
        const resultPostBusiness = await clienteAxios.post(`/b1s/v1/BusinessPartners`, body,
            {
                headers: {
                    Cookie: `${cookies}`
                }
            }
        )
        res.send(resultPostBusiness.data)

    } catch (error) {
        const { response } = error
        if (response && response.data.error.message.value.includes('Existe otro socio')) {
            res.status(401).send({ message: response.data.error.message.value })
            return
        }
        if (response && response.data.error.code === 301) {
            res.status(response.data.error.code).send({ message: response.data.error.message.value })
        } else {
            res.status(500).send({ errorMessage: response.data.error.message.value, message: 'Ocurrió un error, por favor vuelve a intenter' })
        }
    }
}





exports.getStates = async (req, res) => {

    const cookies = req.header('Authorization')

    const uriDecodeCount = decodeURI(`/b1s/v1/States/$count/?$filter=startswith(Country, 'AR')`)
    let iterateTimes
    const allStates = []

    try {

        const statesCount = await clienteAxios.get(uriDecodeCount,
            {
                headers: {
                    Cookie: cookies
                }
            }
        )

        iterateTimes = Math.ceil(statesCount.data / 20)

        for (let index = 0; index < iterateTimes; index++) {
            if (index > 0) {
                const uriDecode = decodeURI(`/b1s/v1/States?$filter=startswith(Country, 'AR')&$skip=${index > 1 ? index * 20 : 20}`)
                const states = await clienteAxios.get(uriDecode,
                    {
                        headers: {
                            Cookie: cookies
                        }
                    }
                )
                states.data.value.map(s => allStates.push(s))
            } else {
                const uriDecode = decodeURI(`/b1s/v1/States?$filter=startswith(Country, 'AR')`)
                const states = await clienteAxios.get(uriDecode,
                    {
                        headers: {
                            Cookie: cookies
                        }
                    }
                )
                states.data.value.map(s => allStates.push(s))
            }

        }
        res.send(allStates)
    } catch (error) {
        const { response } = error
        console.log(response)
        if (response && response.data.error.code === 301) {
            res.status(response.data.error.code).send({ message: response.data.error.message.value })
        } else {
            res.status(response.status).send({ errorMessage: response.data.error.message.value, message: 'Ocurrió un error, por favor vuelve a intenter' })
        }
    }
}

