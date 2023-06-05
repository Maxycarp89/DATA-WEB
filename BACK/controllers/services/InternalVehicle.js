const { clienteAxios } = require('../../utils/clientAxios')

exports.getInternalVehicles = async (req, res) => {

    const cookies = req.header('Authorization');
    const { almacen, vehiculo } = req.query;

    try {
        const resultInternalVehicle = await clienteAxios.get('/b1s/v1/sml.svc/YUH_STOCKVEHICULO?$filter=WhsCode' + decodeURI(` eq '${almacen}' and contains(U_Chasis, '${vehiculo}')`), {
            headers: {
                Cookie: `${cookies}`
            }
        });
        // console.log(resultInternalVehicle.data.value);
        res.send(resultInternalVehicle.data.value)
    } catch (error) {
        res.status(400).send(error)
    }
}
