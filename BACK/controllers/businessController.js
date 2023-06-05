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
    

    const urlParams = decodeURI(!!dni ? `LicTradNum eq '${dni}' and (startswith(ItemCode,'M') or ItemCode eq '')` : !!codCliente ? `CardCode eq '${codCliente}' and (startswith(ItemCode,'M') or ItemCode eq '')` : '')


    try {

        const recursiveFunct = async (skip) => {
        
            const resultClientAndProduct = await clienteAxios.get("/b1s/v1/sml.svc/YUH_CLIENTEYPRODASOCIADOS2?$filter=" + urlParams + ` &$skip=${skip}`,
                {
                    headers: {
                        Cookie: `${cookies}`
                    }
                }
            )
            if (resultClientAndProduct.data.value.length === 0) {
              try {
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
                    res.send({ message: 'No existe ningún cliente con el DNI ingresado' })
                }
              } catch (error) {
                if(error.response.status === 400)
                res.send({ message: 'No existe ningún cliente con el DNI ingresado', status: 400 })

i        }
            } else {            
                
                
                if (resultClientAndProduct.data['@odata.nextLink']) {
                    const { CardCode, CardName, Cellular,Address, E_Mail,ZipCode,City, LicTradNum } = resultClientAndProduct.data.value[0]
                    businessData = { CardCode, CardName,Address, Cellular, E_Mail,ZipCode,City, FederalTaxID: LicTradNum }

                     resultClientAndProduct.data.value.filter(motorBikesFilter =>motorBikesFilter.ItemCode.startsWith("M") && motorBikesFilter.U_Division == "DM").map((el) => motorBikes.push(el))
                    
                    resultClientAndProduct.data.value.filter(bikesFilter => bikes.push(bikesFilter.ItemCode.startsWith("E") && bikesFilter.U_Division == "DB"))
                    // get vehicles with services that they are not from yuhmak
                    services = await serviceControllers.ServiceCalls({ body: { CardCode, cookies } })
                    console.log('motorBikes', motorBikes.length)
                    recursiveFunct(skip + 20)
                
                } else {
                    console.log('SIN NEXT LINK')
                    const { CardCode, CardName, Cellular,Address, E_Mail,ZipCode,City, LicTradNum } = resultClientAndProduct.data.value[0]
                    businessData = { CardCode, CardName,Address, Cellular, E_Mail,ZipCode,City, FederalTaxID: LicTradNum }
                    resultClientAndProduct.data.value.filter(motorBikesFilter =>motorBikesFilter.ItemCode.startsWith("M") && motorBikesFilter.U_Division == "DM").map((el) => motorBikes.push(el))

                    resultClientAndProduct.data.value.filter(bikesFilter => bikes.push(bikesFilter.ItemCode.startsWith("E") && bikesFilter.U_Division == "DB"))
                    // get vehicles with services that they are not from yuhmak
                    services = await serviceControllers.ServiceCalls({ body: { CardCode, cookies } })

                    
                    res.send({ motorBikes, bikes, businessData, services,  })

                }
             
            }
            
           

        }
        recursiveFunct(0)

    } catch (error) {
        console.log('ERRORERRORERROR')
        const { response } = error
        if (response && response.data.error.code === 301) {
            res.status(response.data.error.code).send({ message: response.data.error.message.value })
        } else {
            res.status(response.status).send({ errorMessage: response.data.error.message.value, message: 'Ocurrió un error, por favor vuelve a intenter' })
        }
    }



    // try {
    //     const resultClientAndProduct = await clienteAxios.get("/b1s/v1/sml.svc/YUH_CLIENTEYPRODASOCIADOS2?$filter=" + urlParams, {
    //         headers: {
    //             Cookie: `${cookies}`
    //         }
    //     })
    //     if (resultClientAndProduct.data.value.length === 0) {
    //         const clientExistBusiness = await clienteAxios.get("/b1s/v1/$filter=" + decodeURI(`FederalTaxID eq '${dni}' and CardType eq 'cCustomer'`), {
    //             headers: {
    //                 Cookie: `${cookies}`
    //             }
    //         })
    //         if (clientExistBusiness.data.value.length > 0) {
    //             const { CardCode, CardName, Cellular,Address, E_Mail, FederalTaxID, ZipCode, City } = clientExistBusiness.data.value[0] 
    //             businessData = { CardCode, CardName, Cellular,Address, E_Mail, FederalTaxID,ZipCode,City }
    //             // get vehicles with services that they are not from yuhmak
    //             services = await serviceControllers.ServiceCalls({ body: { CardCode, cookies } })
    //         } else {
    //             res.status(404).send({ message: 'No existe ningún cliente con el DNI ingresado' })
    //         }
    //     } else {
    //         const { CardCode, CardName, Cellular,Address, E_Mail,ZipCode,City, LicTradNum } = resultClientAndProduct.data.value[0]
    //         const resultNextLink = resultClientAndProduct?.data['@odata.nextLink']

    //         businessData = { CardCode, CardName,Address, Cellular, E_Mail,ZipCode,City, FederalTaxID: LicTradNum }
    //         // get vehicles with services that they are not from yuhmak
    //         services = await serviceControllers.ServiceCalls({ body: { CardCode, cookies } })

    //         if(resultNextLink?.length > 0) {
    //     const nextLink = await clienteAxios.get(`/b1s/v1/sml.svc/${resultNextLink}` , {
    //         headers: {
    //             Cookie: `${cookies}`
    //         }
    //     })
    //     if(nextLink?.data['@odata.nextLink']){
    //         const nextLink2 = await clienteAxios.get(`/b1s/v1/sml.svc/${nextLink?.data['@odata.nextLink']}` , {
    //             headers: {
    //                 Cookie: `${cookies}`
    //             }
            
    //         })
    //         if(nextLink2?.data['@odata.nextLink']){
    //             const nextLink3 = await clienteAxios.get(`/b1s/v1/sml.svc/${nextLink2?.data['@odata.nextLink']}` , {
    //                 headers: {
    //                     Cookie: `${cookies}`
    //                 }
                
    //             })
    //             console.log('nextLink3', nextLink3.data)
    //             const motorBikesFirst = resultClientAndProduct.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //             bikes = resultClientAndProduct.data.value.filter(bikes => bikes.ItemCode.startsWith("E") && bikes.U_Division == "DB")
        
    //                 const nextDataMotorBikes = nextLink.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //                 const nextDataMotorBikes2 = nextLink2.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //                 const nextDataMotorBikes3 = nextLink3.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    
    //                 motorBikes = Object.assign(motorBikesFirst,nextDataMotorBikes,nextDataMotorBikes2,nextDataMotorBikes3 ) 

    //         }
    //         else{
    //             const motorBikesFirst = resultClientAndProduct.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //             bikes = resultClientAndProduct.data.value.filter(bikes => bikes.ItemCode.startsWith("E") && bikes.U_Division == "DB")
        
    //                 const nextDataMotorBikes = nextLink.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //                 const nextDataMotorBikes2 = nextLink2.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    
    //                 motorBikes = Object.assign(motorBikesFirst,nextDataMotorBikes,nextDataMotorBikes2 ) 
    //         }
        
    //     }else {
    //         const motorBikesFirst = resultClientAndProduct.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //         bikes = resultClientAndProduct.data.value.filter(bikes => bikes.ItemCode.startsWith("E") && bikes.U_Division == "DB")
    
    //             const nextDataMotorBikes = nextLink.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //             console.log('nextDataMotorBikes', nextDataMotorBikes)
    
    //             motorBikes = Object.assign(motorBikesFirst,nextDataMotorBikes ) 
                
    //     }
       
    //     }        
    //     else {
    //         motorBikes = resultClientAndProduct.data.value.filter(motorBikes => motorBikes.ItemCode.startsWith("M") && motorBikes.U_Division == "DM")
    //         bikes = resultClientAndProduct.data.value.filter(bikes => bikes.ItemCode.startsWith("E") && bikes.U_Division == "DB")
    //     }
    //     res.send({ motorBikes, bikes, businessData, services,  })
    //     }
        
   

    // } catch (error) {
    //     const { response } = error
    //     console.log(error)
    //     if (response.data.error.code && response.data.error.code === 301) {
    //         res.status(response.data.error.code).send({ message: response.data.error.message && response.data.error.message.value })
    //     } else {
    //         res.status(response.status).send({ error: response.data.error.message && response.data.error.message.value, code: response.data.error.code && response.data.error.code, errorMessage: 'Ocurrió un error, por favor vuelve a intenter' })
    //     }
    // }
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

