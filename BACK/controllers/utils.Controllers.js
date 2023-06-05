const { clienteAxios } = require('../utils/clientAxios')
require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

function removeDuplicates(arr) {
    let s = new Set(arr)
    let it = s.values()
    return Array.from(it)
}

const removeInitialOR = new RegExp(/or\s/)

exports.getCombos = async (req, res) => {

    const cookies = req.header('Authorization')

    const { CardCode } = req.query

    try {
        const serviceCombosView = await clienteAxios.get('/b1s/v1/sml.svc/YUH_COMBOSSERVICES2?$filter=CardCode ' + decodeURI(` eq '${CardCode}'`), {
            headers: {
                Cookie: `${cookies}`
            }
        })
        if (serviceCombosView.data.value.length === 0) res.send({ message: 'No posee Combos ni Servicios facturados' })
        else res.send({ result: serviceCombosView.data.value })
    } catch (error) {
        return error
    }
}


exports.getCombosOpen = async (req, res) => {

    const cookies = req.header('Authorization')

    const { CardCode } = req.query

    try {
        const serviceCombosViewQuantity = await clienteAxios.get(`/b1s/v1/sml.svc/YUH_COMBOS3?$filter= OpenQty gt 0 and TreeType not eq 'S' and CardCode` + decodeURI(` eq '${CardCode}'`), {
            headers: {
                Cookie: `${cookies}`
            }
        })
        if (serviceCombosViewQuantity.data.value.length === 0) res.send({ message: 'No posee Combos ni Servicios facturados' })
        else res.send({ result: serviceCombosViewQuantity.data.value })
    } catch (error) {
        return error
    }
}


exports.getCombosOpenI = async (req, res) => {

    const cookies = req.header('Authorization')

    const { CardCode, DocEntry } = req.query

    try {
        const serviceCombosViewQuantityI = await clienteAxios.get(`/b1s/v1/sml.svc/YUH_COMBOS3?$filter=` + decodeURI(`CardCode eq '${CardCode}' and DocEntry eq ${DocEntry} and TreeType not eq 'N'`), {
            headers: {
                Cookie: `${cookies}`
            }
        })
        if (serviceCombosViewQuantityI.data.value.length === 0) res.send({ message: 'No posee Combos ni Servicios facturados' })
        else res.send({ result: serviceCombosViewQuantityI.data.value })
    } catch (error) {
        return error
    }
}



exports.CheckAlreadySell = async (req) => {

    const { clientCode, clientName, vehicle, remitoDocEntry, cookies } = req.body
    let query = '/b1s/v1/CustomerEquipmentCards?$select=CustomerCode,EquipmentCardNum&$filter=InternalSerialNum' + decodeURI(` eq '${vehicle}' and ServiceBPType eq 'et_Sales'`)
    try {
        const resultCheck = await clienteAxios.get(query, {
            headers: {
                Cookie: `${cookies}`
            }
        })
        let checkCode
        let equipmentCard

        if(resultCheck.data.value.length > 0) {
            resultCheck.data.value.map(({ CustomerCode, EquipmentCardNum }) => {
           
            
                CustomerCode === clientCode ? checkCode = true : checkCode = false
            equipmentCard = EquipmentCardNum
    
        })
        }else{
            checkCode = 'SIN VALOR'
            console.log('SIN VALOR CHECKCODE')

          
        }
        if (checkCode === false ) {
            const solveIncorrectRecord = await clienteAxios.patch(`/b1s/v1/CustomerEquipmentCards(${equipmentCard})`, { CustomerCode: clientCode, CustomerName: clientName, DirectCustomerCode: clientCode, DeliveryCode: remitoDocEntry }, {
                headers: {
                    Cookie: `${cookies}`
                }
            })
       
          

            if (solveIncorrectRecord.status === 204 && solveIncorrectRecord.statusText === 'No Content') {
                return true
            } else {
                return solveIncorrectRecord
            }
        } else {
            return checkCode
        }
    } catch (error) {
        console.log(`exports.CheckAlreadySell= ~ error`, error.response.data.error)
        return error
    }
}

exports.CheckAlreadyPurchased = async (req) => {

    const { vehicle, cookies } = req.body
    try {

        const resultCheck = await clienteAxios.get('/b1s/v1/CustomerEquipmentCards?$select=StatusOfSerialNumber,EquipmentCardNum,ServiceBPType&$filter=InternalSerialNum' + decodeURI(` eq '${vehicle}'`), {

       

            headers: {
                Cookie: `${cookies}`
            }
        })



        let checkCode
        let equipmentCard

    //   const newData =  resultCheck.data.value.map(({ StatusOfSerialNumber, EquipmentCardNum }) => {
    //         StatusOfSerialNumber == 'sns_Terminated' ? checkCode = false : checkCode = true
    //         equipmentCard = EquipmentCardNum
    //     })

        console.log('resultCheck', resultCheck.data.value)

        const newData = resultCheck.data.value.map((el) => 
         (   {'StatusOfSerialNumber':el.StatusOfSerialNumber == 'sns_Terminated' ? checkCode = false : checkCode = true,
         'EquipmentCard': el.EquipmentCardNum,
        'ServiceBPType': el.ServiceBPType
        })
        )



        if(newData.length === 0)
        {
            return checkCode = 'NoContent'
        }else {
            if(newData[0].ServiceBPType === 'et_Purchasing')
            {
                if (!checkCode) {
                    const solveIncorrectRecord = await clienteAxios.patch(`/b1s/v1/CustomerEquipmentCards(${equipmentCard})`, { StatusOfSerialNumber:'sns_Active' }, {
                        headers: {
                            Cookie: `${cookies}`
                        }
                    })
        
                    if (solveIncorrectRecord.status === 204 && solveIncorrectRecord.statusText === 'No Content') {
                        return checkCode ='Tarjeta Reabierta'
                    } else {
                        return solveIncorrectRecord
                    }
                } else { 
                    return checkCode = 'Tarjeta Abierta'
                }
            }else {
            
            return {checkCode: 'Tipo Venta',EquipmentCard:  newData[0].EquipmentCard } 
            }
          
        }


   


    } catch (error) {
        // console.log(`exports.CheckAlreadySell= ~ error`, error.response.data.error)
        return error
    }
}

exports.generateEquipamentCard = async (req) => {
    const { clientCode, itemCode, vehicle,ServiceBPType, cookies } = req.body

    try {
        const BODY = {
            InternalSerialNum: vehicle, CustomerCode: clientCode, ItemCode: itemCode, ServiceBPType: ServiceBPType
        }
        const resultCreateEquipamentCard = await clienteAxios.post('/b1s/v1/CustomerEquipmentCards',BODY , {
            headers: {
                Cookie: `${cookies}`
            }
        })
        return resultCreateEquipamentCard
    } catch (error) {
        return error
    }
}


// exports.generateEquipamentCardV2 = async (req) => {
//     const { clientCode, itemCode, vehicle,ServiceBPType,CustomerName,DirectCustomerCode,DeliveryCode, cookies } = req.body

 
//     try {
//         const resultCreateEquipamentCard = await clienteAxios.post('/b1s/v1/CustomerEquipmentCards', {
//             InternalSerialNum: vehicle, CustomerCode: clientCode, ItemCode: itemCode,CustomerName:CustomerName, DirectCustomerCode:DirectCustomerCode,DeliveryCode:DeliveryCode, ServiceBPType: ServiceBPType
//         }, {
//             headers: {
//                 Cookie: `${cookies}`
//             }
//         })
//         return resultCreateEquipamentCard
//     } catch (error) {
//         return error
//     }
// }


exports.cancelActualEquipamentCard = async (req) => {
    const { clientCode, vehicle, cookies } = req.body
    console.log(clientCode, cookies, vehicle)
    try {
        const resultCheck = await clienteAxios.get('/b1s/v1/CustomerEquipmentCards?$select=CustomerCode,EquipmentCardNum,StatusOfSerialNumber&$filter=InternalSerialNum' + decodeURI(` eq '${vehicle}' and StatusOfSerialNumber eq 'sns_Active' and ServiceBPType eq 'et_Purchasing'`), {
            headers: {
                Cookie: `${cookies}`
            }
        })

        const terminateEquipamentCard = await clienteAxios.patch(`/b1s/v1/CustomerEquipmentCards(${resultCheck.data.value[0].EquipmentCardNum})`, { StatusOfSerialNumber: 'sns_Terminated' }, {
            headers: {
                Cookie: `${cookies}`
            }
        })

        if (terminateEquipamentCard.status === 204 && terminateEquipamentCard.statusText === 'No Content') {
            return true
        } else {
            return terminateEquipamentCard
        }

    } catch (error) {
        console.log(`exports.cancelActualEquipamentCard= ~ error`, error.response.data.error)
        return error
    }
}

exports.cancelActualEquipamentCardSales = async (req) => {
    const {vehicle, cookies } = req.body
    console.log(cookies, vehicle)
    try {
        const resultCheck = await clienteAxios.get('/b1s/v1/CustomerEquipmentCards?$select=CustomerCode,EquipmentCardNum,StatusOfSerialNumber&$filter=InternalSerialNum' + decodeURI(` eq '${vehicle}' and StatusOfSerialNumber eq 'sns_Active' and ServiceBPType eq 'et_Sales'`), {
            headers: {
                Cookie: `${cookies}`
            }
        })

        const terminateEquipamentCard = await clienteAxios.patch(`/b1s/v1/CustomerEquipmentCards(${resultCheck.data.value[0].EquipmentCardNum})`, { StatusOfSerialNumber: 'sns_Terminated' }, {
            headers: {
                Cookie: `${cookies}`
            }
        })

        if (terminateEquipamentCard.status === 204 && terminateEquipamentCard.statusText === 'No Content') {
            return true
        } else {
            return terminateEquipamentCard
        }

    } catch (error) {
        console.log(`exports.cancelActualEquipamentCard= ~ error`, error.response.data.error)
        return error
    }
}
