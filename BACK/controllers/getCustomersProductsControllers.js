const { clienteAxios } = require('../utils/clientAxios')
// const { CheckAlreadySell, generateEquipamentCard, cancelActualEquipamentCard } = require('./utils.Controllers')
require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const regexItemCodeVehicles = /M\d{10}/
const regexItemCodeBikes = /E\d{10}/
// const regexItemCodeElectros = /E\d{10}/

// get all vehicles whitout Credit Notes
exports.getMotorBikes = async (req) => {

    const { stringBaseType13, RemoveDocEntry, CardCode, Cookies } = req.query
    console.log(`exports.getMotorBikes= ~ CardCode`, CardCode)

    let vehicles = []
    let branOfficeNameID = []
    let AllBrandOffices = ''

    try {
        const recursiveBikes = async (skip) => {

            console.log('/b1s/v1/$crossjoin(DeliveryNotes,DeliveryNotes/DocumentLines)?$expand=DeliveryNotes($select=DocEntry,BPLName)&$filter=DeliveryNotes/CardCode' + decodeURI(` eq '${CardCode}' and DeliveryNotes/DocEntry eq DeliveryNotes/DocumentLines/DocEntry and startswith(DeliveryNotes/DocumentLines/ItemCode, 'M') and DeliveryNotes/Cancelled eq 'tNO' ${(!!stringBaseType13 && !!RemoveDocEntry) ? 'and not (' + stringBaseType13 + RemoveDocEntry + ')' : ''}&$skip=${skip}`))

            // set queryString to get all vehicles whitout Credit Notes 
            const resultHasMotoCicle = await clienteAxios.get('/b1s/v1/$crossjoin(DeliveryNotes,DeliveryNotes/DocumentLines)?$expand=DeliveryNotes($select=DocEntry,BPLName)&$filter=DeliveryNotes/CardCode' + decodeURI(` eq '${CardCode}' and DeliveryNotes/DocEntry eq DeliveryNotes/DocumentLines/DocEntry and startswith(DeliveryNotes/DocumentLines/ItemCode, 'M') and DeliveryNotes/Cancelled eq 'tNO' ${(!!stringBaseType13 && !!RemoveDocEntry) ? 'and not (' + stringBaseType13 + RemoveDocEntry + ')' : ''}&$skip=${skip}`), {
                headers: {
                    Cookie: Cookies
                }
            })

            const uniqueVehicle = resultHasMotoCicle.data.value.reduce(function (p, c) {
                if (!p.some(function (el) { return el.DeliveryNotes.DocEntry === c.DeliveryNotes.DocEntry })) p.push(c)
                return p
            }, [])

            for (let doc of uniqueVehicle) {
                branOfficeNameID.push(doc.DeliveryNotes.BPLName)
                const motoData = await clienteAxios.get(`/b1s/v1/DeliveryNotes(${doc.DeliveryNotes.DocEntry})`,
                    {
                        headers: {
                            Cookie: Cookies
                        }
                    }
                )
                for (let serialNumbers of motoData.data.DocumentLines) {
                    if (regexItemCodeVehicles.test(serialNumbers.ItemCode)) {
                        Object.assign(serialNumbers, { FolioNumberFrom: motoData.data.FolioNumberFrom, PointOfIssueCode: motoData.data.PointOfIssueCode, DocEntry: motoData.data.DocEntry, BPLName: motoData.data.BPLName })
                        vehicles.push(serialNumbers)
                    }
                }
            }

            if (resultHasMotoCicle.data['odata.nextLink']) {
                await recursiveBikes(skip + 20)
            }

            for (let id of Array.from(new Set([...branOfficeNameID]))) {
                AllBrandOffices !== '' ? AllBrandOffices += ` or BPLName eq '${id}'` : AllBrandOffices += `BPLName eq '${id}'`

            }

            if (AllBrandOffices !== '') {
                const sucursal = await clienteAxios.get(`/b1s/v1/BusinessPlaces?$select=BPLName,AliasName,Street&$filter=${AllBrandOffices !== '' && AllBrandOffices}`,
                    {
                        headers: {
                            Cookie: Cookies
                        }
                    }
                )

                if (sucursal.data.value.length > 0) {
                    sucursal.data.value.map(suc => vehicles.map(moto => suc.BPLName === moto.BPLName && Object.assign(moto, { 'AliasName': suc.AliasName })))
                }
            }
        }
        await recursiveBikes(0)
        return vehicles
    } catch (error) {
        console.log(error)
    }
}


exports.getBikes = async (req) => {

    const { stringBaseType13, RemoveDocEntry, CardCode, Cookies } = req.query

    let vehicles = []
    let branOfficeNameID = []
    let AllBrandOffices = ''
    try {
        const recursiveBikes = async (skip) => {

            // set queryString to get all vehicles whitout Credit Notes 
            const resultHasMotoCicle = await clienteAxios.get('/b1s/v1/$crossjoin(DeliveryNotes,DeliveryNotes/DocumentLines)?$expand=DeliveryNotes($select=DocEntry,BPLName)&$filter=DeliveryNotes/CardCode' + decodeURI(` eq '${CardCode}' and DeliveryNotes/DocEntry eq DeliveryNotes/DocumentLines/DocEntry and startswith(DeliveryNotes/DocumentLines/ItemCode, 'E') and DeliveryNotes/Cancelled eq 'tNO' ${(!!stringBaseType13 && !!RemoveDocEntry) ? 'and not (' + stringBaseType13 + RemoveDocEntry + ')' : ''}&$skip=${skip}`), {
                headers: {
                    Cookie: Cookies
                }
            })

            // resultHasMotoCicle.data.value.map(val => console.log(val.DeliveryNotes.));

            const uniqueVehicle = resultHasMotoCicle.data.value.reduce(function (p, c) {
                if (!p.some(function (el) { return el.DeliveryNotes.DocEntry === c.DeliveryNotes.DocEntry })) p.push(c)
                return p
            }, [])

            for (let doc of uniqueVehicle) {
                branOfficeNameID.push(doc.DeliveryNotes.BPLName)
                const bikeData = await clienteAxios.get(`/b1s/v1/DeliveryNotes(${doc.DeliveryNotes.DocEntry})`,
                    {
                        headers: {
                            Cookie: Cookies
                        }
                    }
                )
                for (let serialNumbers of bikeData.data.DocumentLines) {
                    if (regexItemCodeBikes.test(serialNumbers.ItemCode) && serialNumbers.SerialNumbers.length > 0) {
                        Object.assign(serialNumbers, { FolioNumberFrom: bikeData.data.FolioNumberFrom, PointOfIssueCode: bikeData.data.PointOfIssueCode, DocEntry: bikeData.data.DocEntry, BPLName: bikeData.data.BPLName })
                        vehicles.push(serialNumbers)
                    }
                }
            }

            if (resultHasMotoCicle.data['odata.nextLink']) {
                await recursiveBikes(skip + 20)
            }

            for (let id of Array.from(new Set([...branOfficeNameID]))) {
                AllBrandOffices !== '' ? AllBrandOffices += ` or BPLName eq '${id}'` : AllBrandOffices += `BPLName eq '${id}'`

            }

            if (AllBrandOffices !== '') {
                const sucursal = await clienteAxios.get(`/b1s/v1/BusinessPlaces?$select=BPLName,AliasName,Street&$filter=${AllBrandOffices !== '' && AllBrandOffices}`,
                    {
                        headers: {
                            Cookie: Cookies
                        }
                    }
                )

                if (sucursal.data.value.length > 0) {
                    sucursal.data.value.map(suc => vehicles.map(moto => suc.BPLName === moto.BPLName && Object.assign(moto, { 'AliasName': suc.AliasName })))
                }
            }
        }
        await recursiveBikes(0)
        return vehicles
    } catch (error) {
        console.log(error)
    }
}