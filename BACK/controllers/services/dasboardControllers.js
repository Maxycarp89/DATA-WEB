const { clienteAxios } = require("../../utils/clientAxios");

exports.getOwnServices = async (req, res) => {
  const cookies = req.header("Authorization");
  const { frDate, ltDate, user } = req.query;
  console.log(frDate, ltDate, user);
  const allServices = [];

  try {
    const recursiveGetOwnServices = async (skip) => {
      const resultServices = await clienteAxios.get(
        "/b1s/v1/ServiceCalls?$select=ServiceCallID,Subject,Status,CustomerCode,InternalSerialNum,CreationDate,U_Chasis&$filter=" +
          decodeURI(
            `AssigneeCode eq ${user} and (CreationDate ge '${frDate}' and CreationDate le '${ltDate}') and BPShipToAddress ne 'hogar'&$skip=${skip}`
          ),
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (!!resultServices.data["odata.nextLink"]) {
        resultServices.data.value.map((val) => allServices.push(val));
        recursiveGetOwnServices(skip + 20);
      } else if (!!resultServices.data["odata.nextLink"] === false) {
        resultServices.data.value.map((val) => allServices.push(val));
        res.send(allServices);
      }
    };
    recursiveGetOwnServices(0);
  } catch (error) {
    res.status(400).send(error.response.data.error);
  }
};

exports.getOwnHomeServices = async (req, res) => {
  const cookies = req.header("Authorization");
  const { frDate, ltDate, user } = req.query;
  console.log(frDate, ltDate, user);
  const allServices = [];

  try {
    const recursiveGetOwnServices = async (skip) => {
      const resultServices = await clienteAxios.get(
        "/b1s/v1/ServiceCalls?$select=ServiceCallID,ItemCode,ItemDescription,ServiceCallActivities,Status,CustomerCode,InternalSerialNum,CustomerCode,CreationDate,U_Chasis&$orderby=ServiceCallID asc&$filter=" +
          decodeURI(
            `AssigneeCode eq ${user} and (CreationDate ge '${frDate}' and CreationDate le '${ltDate}') and BPShipToAddress eq 'hogar'&$skip=${skip}`
          ),
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (!!resultServices.data["odata.nextLink"]) {
        resultServices.data.value.map((val) => allServices.push(val));
        recursiveGetOwnServices(skip + 20);
      } else if (!!resultServices.data["odata.nextLink"] === false) {
        resultServices.data.value.map((val) => allServices.push(val));
        res.send(allServices);
      }
    };
    recursiveGetOwnServices(0);
  } catch (error) {
    res.status(400).send(error.response.data.error);
  }
};
