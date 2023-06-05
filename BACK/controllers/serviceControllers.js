const { clienteAxios } = require("../utils/clientAxios");
const {
  CheckAlreadySell,
  generateEquipamentCard,
  cancelActualEquipamentCard,
  CheckAlreadyPurchased,
  cancelActualEquipamentCardSales,
} = require("./utils.Controllers");
require("tls").DEFAULT_MIN_VERSION = "TLSv1";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function removeDuplicates(arr) {
  let s = new Set(arr);
  let it = s.values();
  return Array.from(it);
}

const pat = /and\s/;
const removeInitialOR = new RegExp(/or\s/);

exports.PostServiceCalls = async (req, res) => {
  const cookies = req.header("Authorization");
  const {
    remitoDocEntry,
    ItemDescription,
    Origin,
    ProblemType,
    ProblemSubType,
    CallType,
    AssigneeCode,
    TechnicianCode,
    U_Kilometraje,
    ...rest
  } = req.body;
  console.log(req.body);
  if (ProblemType == "33") {
    Object.assign(rest, {
      U_Alarma: "Sí",
      U_Casco: "Sí",
      U_Kit_Herramientas: "No",
      U_Faltante: "No",
      U_Rayado: "No",
      U_Rotura: "No",
      U_Nivel_Combustible: "10",
      U_Manchado: "No",
    });
  }

  try {
    if (!!remitoDocEntry) {
      const checkEquipamentCard = await CheckAlreadySell({
        body: {
          remitoDocEntry: remitoDocEntry,
          vehicle: rest.InternalSerialNum,
          clientCode: rest.CustomerCode,
          clientName: rest.CustomerName,
          cookies: cookies,
        },
      });
      console.log("checkEquipamentCard", checkEquipamentCard);
      if (checkEquipamentCard !== true) {
        if (
          !!checkEquipamentCard &&
          checkEquipamentCard.response.data.error.code === 301
        ) {
          res.status(checkEquipamentCard.response.data.error.code).send({
            message:
              checkEquipamentCard.response.data.error.message &&
              checkEquipamentCard.response.data.error.message.value,
          });
          return;
        } else {
          res.status(checkEquipamentCard.response.status).send({
            errorMessage:
              checkEquipamentCard.response.data.error.message &&
              checkEquipamentCard.response.data.error.message.value,
            message: "Ocurrió un error, por favor vuelve a intenter",
            code: checkEquipamentCard.response.data.error,
          });
          return;
        }
      }
    } else if (!!remitoDocEntry === false && !!rest.ServiceBPType) {
      if (rest.ServiceBPType == "srvcPurchasing") {
        const checkEquipamentCardP = await CheckAlreadyPurchased({
          body: { vehicle: rest.InternalSerialNum, cookies: cookies },
        });
        console.log("checkEquipamentCardP", checkEquipamentCardP);
        if (checkEquipamentCardP == "NoContent") {
          const resultGenerateCard = await generateEquipamentCard({
            body: {
              vehicle: rest.InternalSerialNum,
              clientCode: rest.CustomerCode,
              itemCode: rest.ItemCode,
              ServiceBPType: "et_Purchasing",
              cookies: cookies,
            },
          });
        }
        if (checkEquipamentCardP.checkCode === "Tipo Venta") {
          const resultCancelCard = await cancelActualEquipamentCardSales({
            body: {
              vehicle: rest.InternalSerialNum,
              cookies: cookies,
            },
          });

          if (resultCancelCard === true) {
            const tryAgainGenerateCard = await generateEquipamentCard({
              body: {
                vehicle: rest.InternalSerialNum,
                clientCode: rest.CustomerCode,
                itemCode: rest.ItemCode,
                ServiceBPType: "et_Purchasing",
                cookies: cookies,
              },
            });
          }
        }
      } else {
        const resultGenerateCard = await generateEquipamentCard({
          body: {
            vehicle: rest.InternalSerialNum,
            clientCode: rest.CustomerCode,
            itemCode: rest.ItemCode,
            ServiceBPType: "et_Sales",
            cookies: cookies,
          },
        });

        if (
          resultGenerateCard.response.data.error.message.value.includes(
            "Enter valid code  [OINS.customer]"
          )
        ) {
          res.status(resultGenerateCard.response.status).send({
            errorMessage: "Solicitar creación de tarjeta de Equipo",
            message: resultGenerateCard.response.data.error.message.value,
            code: resultGenerateCard.response.data.error,
          });
          return;
        }
        if (
          resultGenerateCard.response.data.error.message.value.includes(
            "Serial number already exists. "
          )
        ) {
          const resultCancelCard = await cancelActualEquipamentCard({
            body: {
              vehicle: rest.InternalSerialNum,
              clientCode: rest.CustomerCode,
              cookies: cookies,
            },
          });
          if (resultCancelCard === true) {
            const tryAgainGenerateCard = await generateEquipamentCard({
              body: {
                vehicle: rest.InternalSerialNum,
                clientCode: rest.CustomerCode,
                itemCode: rest.ItemCode,
                cookies: cookies,
              },
            });

            if (
              tryAgainGenerateCard.response.data.error.message.value.includes(
                "Enter valid code  [OINS.customer]"
              )
            ) {
              res.status(tryAgainGenerateCard.response.status).send({
                errorMessage: "Solicitar creación de tarjeta de Equipo",
                message: tryAgainGenerateCard.response.data.error.message.value,
                code: tryAgainGenerateCard.response.data.error,
              });
              return;
            }
          }
        }
      }
    }

    const result = await clienteAxios.post(
      "/b1s/v1/ServiceCalls",
      {
        Origin: Number(Origin),
        ProblemType: Number(ProblemType),
        ProblemSubType: Number(ProblemSubType),
        CallType: Number(CallType),
        AssigneeCode: Number(AssigneeCode),
        TechnicianCode: Number(TechnicianCode),
        U_Kilometraje: Number(U_Kilometraje),
        ItemDescription:
          !!rest.ItemCode === false && !!rest.InternalSerialNum === false
            ? ItemDescription
            : null,
        ...rest,
      },
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    res.send(result.data);
  } catch (error) {
    console.log(error);
    const { response } = error;
    if (!!response && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.EditServiceCalls = async (req, res) => {
  const cookies = req.header("Authorization");
  const {
    ActivityCode,
    Status,
    ServiceCallID,
    ItemDescription,
    remitoDocEntry,
    ...rest
  } = req.body;

  try {
    const editService = await clienteAxios.patch(
      `/b1s/v1/ServiceCalls(${ServiceCallID})`,
      !!ActivityCode || (!!ActivityCode && Status == "-1")
        ? {
            ...rest,
            ServiceCallActivities: [{ ActivityCode: ActivityCode }],
            Status: -3,
          }
        : rest,
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );

    if (rest?.ServiceBPType === "srvcPurchasing" && Status === "-1") {
      const resultCancelCard2 = cancelActualEquipamentCard({
        body: {
          vehicle: rest.InternalSerialNum,
          clientCode: rest.CustomerCode,
          cookies: cookies,
        },
      });
    }

    if (
      editService.status === 204 &&
      editService.statusText === "No Content" &&
      Status == "-1"
    ) {
      const reeditService = await clienteAxios.patch(
        `/b1s/v1/ServiceCalls(${ServiceCallID})`,
        { Status: -1 },
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (
        reeditService.status === 204 &&
        reeditService.statusText === "No Content"
      ) {
        res.send("Llamada de Servicio editada Correctamente");
      }
    } else if (
      editService.status === 204 &&
      editService.statusText === "No Content"
    ) {
      const editService = await clienteAxios.patch(
        `/b1s/v1/ServiceCalls(${ServiceCallID})`,
        { Status: Status },
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (
        editService.status === 204 &&
        editService.statusText === "No Content"
      ) {
        res.send("Llamada de Servicio editada Correctamente");
      }
    }
  } catch (error) {
    const { response } = error;
    console.log(error);
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.GetItems = async (req, res) => {
  const cookies = req.header("Authorization");

  let queryStringItems = "";

  const searchType =
    req.query.searchType !== undefined ? req.query.searchType : "Código";
  let codigo = "";
  try {
    if (searchType === "Código") {
      if (req.query.item.length < 10) {
        codigo = "R" + "0".repeat(10 - req.query.item.length) + req.query.item;
      } else {
        codigo = req.query.item;
      }
      const resultGetItems = await clienteAxios.get(
        `/b1s/v1/Items('${codigo}')`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      for (let stock of [resultGetItems.data]) {
        if (stock.Valid === "tYES") {
          for (let ware of stock.ItemWarehouseInfoCollection) {
            ware.WarehouseCode === req.query.warehouse && ware.InStock > 0
              ? res.send([resultGetItems.data])
              : ware.WarehouseCode === req.query.warehouse &&
                ware.InStock < 1 &&
                res.send({
                  message: "No hay Stock",
                  itemCode: stock.ItemCode,
                  itemDescrip: stock.ItemName,
                });
          }
        } else if (stock.Valid === "tNO") {
          for (let ware of stock.ItemWarehouseInfoCollection) {
            ware.WarehouseCode === req.query.warehouse && ware.InStock > 0
              ? res.send({
                  message: "No hay Stock",
                  itemCode: stock.ItemCode,
                  itemDescrip: stock.ItemName,
                })
              : ware.WarehouseCode === req.query.warehouse &&
                ware.InStock < 1 &&
                res.send({
                  message: "No hay Stock",
                  itemCode: stock.ItemCode,
                  itemDescrip: stock.ItemName,
                });
          }
        }
      }
    } else {
      const arrayWords = req.query.item.split(" ");
      console.log(arrayWords);

      arrayWords.map(
        (w) =>
          (queryStringItems += `and (contains(ItemName,'${w.toLowerCase()}') or contains(ItemName,'${w.toUpperCase()}')) `)
      );
      const allItems = [];

      async function recursiveFunctItems(skip) {
        const resultGetItems = await clienteAxios.get(
          `/b1s/v1/Items?$select=ItemCode,ItemName,SalesUnit&$skip=${skip}&$filter=` +
            decodeURI(queryStringItems.replace(pat, "")),
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );
        if (resultGetItems.data["odata.nextLink"]) {
          resultGetItems.data.value.map((item) => allItems.push(item));
          recursiveFunctItems(skip + 20);
        } else {
          resultGetItems.data.value.map((item) => allItems.push(item));
          res.send(allItems);
        }
      }
      recursiveFunctItems(0);
    }
  } catch (error) {
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.PostInventoryGenExits = async (req, res) => {
  const cookies = req.header("Authorization");

  const { BPL_IDAssignedToInvoice, DocumentLines } = req.body;

  try {
    const resultSalidaMercancia = await clienteAxios.post(
      "/b1s/v1/InventoryGenExits",
      {
        U_Tipo_Operacion: "1",
        GroupNumber: -2,
        BPL_IDAssignedToInvoice,
        DocumentLines,
      },
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    res.send(resultSalidaMercancia.data);
  } catch (error) {
    const { response } = error;
    console.log(error);
    console.log(error.response.data.error);
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.PostActivities = async (req, res) => {
  const cookies = req.header("Authorization");

  const { DocEntry, CardCode } = req.body;
  console.log(req.body);

  try {
    const resultPostActivity = await clienteAxios.post(
      "/b1s/v1/Activities",
      { DocEntry, CardCode, DocType: "60" },
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    console.log(resultPostActivity.data);
    res.send(resultPostActivity.data);
  } catch (error) {
    console.log(error);
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.PostEntregaCS = async (req, res) => {
  const cookies = req.header("Authorization");
  console.log(cookies);
  try {
    const resultPostEntregaCS = await clienteAxios.post(
      "/b1s/v1/DeliveryNotes",
      req.body,
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    res.send(resultPostEntregaCS.data);
  } catch (error) {
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.GetActivities = async (req, res) => {
  const cookies = req.header("Authorization");

  const codes = req.query.ActivityCodes;

  let queryInventeryExitCodes = "";

  try {
    if (codes.length > 1) {
      for (let count of codes) {
        const resultSalidaMercancia = await clienteAxios.get(
          `/b1s/v1/Activities(${JSON.parse(count).ActivityCode})`,
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );
        queryInventeryExitCodes !== ""
          ? (queryInventeryExitCodes += `or DocEntry eq ${resultSalidaMercancia.data.DocEntry} `)
          : (queryInventeryExitCodes += `DocEntry eq ${resultSalidaMercancia.data.DocEntry} `);
      }

      const resultExitInventory = await clienteAxios.get(
        "/b1s/v1/InventoryGenExits?$filter=" +
          decodeURI(queryInventeryExitCodes),
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );

      const itemsToSend = [];

      for (let getExit of resultExitInventory.data.value) {
        for (let items of getExit.DocumentLines) {
          itemsToSend.push(items);
        }
      }
      res.send(itemsToSend);
    } else {
      const resultSalidaMercancia = await clienteAxios.get(
        `/b1s/v1/Activities(${JSON.parse(codes).ActivityCode})`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );

      const resultExitInventory = await clienteAxios.get(
        `/b1s/v1/InventoryGenExits(${resultSalidaMercancia.data.DocEntry})`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );

      res.send(resultExitInventory.data.DocumentLines);
    }
  } catch (error) {
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.ServiceCallOrigins = async (req, res) => {
  const cookies = req.header("Authorization");
  const { conditions } = req.query;

  try {
    const result = await clienteAxios.get(
      decodeURI(
        `/b1s/v1/ServiceCallOrigins?$filter=contains(Description,'${conditions}')`
      ),
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    res.send(result.data.value);
  } catch (error) {
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.ServiceCallProblemTypes = async (req, res) => {
  const cookies = req.header("Authorization");

  const { conditions } = req.query;

  try {
    const result = await clienteAxios.get(
      "/b1s/v1/ServiceCallProblemTypes?$filter=" + decodeURI(`${conditions}`),
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    console.log(result);
    res.send(result.data.value);
  } catch (error) {
    console.log(error);
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.ServiceCallProblemSubTypes = async (req, res) => {
  const cookies = req.header("Authorization");

  const { conditions } = req.query;

  try {
    const allServicesSubProblems = [];

    const recursiveFunct = async (skip) => {
      const resultSubProblemTypes = await clienteAxios.get(
        "/b1s/v1/ServiceCallProblemSubTypes?" +
          decodeURI(`$filter=${conditions}&$skip=${skip}`),
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      resultSubProblemTypes.data.value.map((v) =>
        allServicesSubProblems.push(v)
      );
      if (resultSubProblemTypes.data["odata.nextLink"]) {
        recursiveFunct(skip + 20);
      } else {
        res.send(allServicesSubProblems);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.ServiceCallTypes = async (req, res) => {
  const cookies = req.header("Authorization");
  try {
    const result = await clienteAxios.get("/b1s/v1/ServiceCallTypes", {
      headers: {
        Cookie: `${cookies}`,
      },
    });
    res.send(result.data.value);
  } catch (error) {
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.ServiceCalls = async (req, res) => {
  let cookies;
  let Chasis;
  let serviceCallID;
  let CustomerCode;

  if (req.query) {
    serviceCallID = req.query.serviceCallID;
    Chasis = req.query.Chasis;
    CustomerCode = req.query.CustomerCode;
    cookies = req.header("Authorization");
  } else if (req.body) {
    CustomerCode = req.body.CardCode;
    cookies = req.body.cookies;
  }

  const arrayWithPLacesID = [];
  const allServices = [];
  const vehiclesTheyAreNotFromYuhmak = [];

  try {
    if (!!serviceCallID) {
      const getServiceQuery = decodeURI(
        `/b1s/v1/ServiceCalls?$filter=ServiceCallID eq ${serviceCallID}`
      );
      const uniqueServiceResult = await clienteAxios.get(getServiceQuery, {
        headers: {
          Cookie: `${cookies}`,
        },
      });

      res.send(uniqueServiceResult.data.value);
      return;
    }

    if (!!req.query) {
      const recursiveFunct = async (skip) => {
        const getServiceQuery = decodeURI(
          `/b1s/v1/ServiceCalls?$filter=CustomerCode eq '${CustomerCode}' and U_Chasis eq '${Chasis}' and Status ne 1 &$skip=${skip}&$orderby=CreationDate desc`
        );
        const servicio = await clienteAxios.get(getServiceQuery, {
          headers: {
            Cookie: `${cookies}`,
          },
        });
        servicio.data.value.map((service) => {
          allServices.push(service);
          arrayWithPLacesID.push(service.U_Almacen);
        });

        if (servicio.data["odata.nextLink"]) {
          await recursiveFunct(skip + 20);
        }
      };
      await recursiveFunct(0);
    } else {
      // if exists services from vehicles that they are not from yuhmak
      console.log(CustomerCode);
      const getAllServiceQuery = decodeURI(
        `/b1s/v1/ServiceCalls?$filter=CustomerCode eq '${CustomerCode}' and (InternalSerialNum eq 'null' or InternalSerialNum eq '') and Status ne 1&$orderby=CreationDate desc`
      );
      const servicioVehiclesTheyAreNotFromYuhmak = await clienteAxios.get(
        getAllServiceQuery,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      console.log(servicioVehiclesTheyAreNotFromYuhmak.data);

      if (servicioVehiclesTheyAreNotFromYuhmak.data.value !== 0) {
        servicioVehiclesTheyAreNotFromYuhmak.data.value.map((service) => {
          allServices.push(service);
          vehiclesTheyAreNotFromYuhmak.push({
            U_Motor: service.U_Motor,
            U_Chasis: service.U_Chasis,
            ItemDescription: service.ItemDescription,
            ItemCode: service.ItemCode,
            CardCode: service.CustomerCode,
            InternalSerialNumber: service.InternalSerialNum,
            U_Almacen: service.U_Almacen,
          });
          arrayWithPLacesID.push(service.U_Almacen);
        });
      }
    }
    const arrayUniquePlacesID = removeDuplicates(arrayWithPLacesID);
    if (arrayUniquePlacesID.length > 0) {
      let AllNameID = "";

      for (let id of arrayUniquePlacesID) {
        AllNameID += ` or BPLName eq '${id}'`;
      }

      const sucursal = await clienteAxios.get(
        `/b1s/v1/BusinessPlaces?$select=BPLName,AliasName,Street&$filter=${AllNameID.replace(
          removeInitialOR,
          ""
        )}`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );

      const out = vehiclesTheyAreNotFromYuhmak.reduce(function (p, c) {
        if (
          !p.some(function (el) {
            return el.U_Chasis === c.U_Chasis;
          })
        )
          p.push(c);
        return p;
      }, []);

      const almacen = sucursal.data.value;
      const services = allServices;

      if (Chasis) {
        services.map((service) =>
          almacen.map(
            (suc) =>
              suc.BPLName === service.U_Almacen &&
              Object.assign(service, { AliasName: suc.AliasName })
          )
        );
        res.send(services);
      } else {
        out.map((service) =>
          almacen.map(
            (suc) =>
              suc.BPLName === service.U_Almacen &&
              Object.assign(service, { AliasName: suc.AliasName })
          )
        );
        return out;
      }
    } else {
      if (req.query) {
        res.send({ message: "No posee Service" });
      } else if (req.body) {
        return { message: "No posee Service" };
      }
    }
  } catch (error) {
    const { response } = error;
    if (!response) {
      console.log(error);
      return;
    }
    if (response && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message: response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage: response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
      });
    }
  }
};

exports.EmployeesInfo = async (req, res) => {
  const cookies = req.header("Authorization");

  const allEmployees = [];

  try {
    const recursiveFunct = async (skip) => {
      const uriDecode = decodeURI(
        `/b1s/v1/$crossjoin(EmployeesInfo,EmployeesInfo/EmployeeRolesInfoLines)?$inlinecount=allpages&$expand=EmployeesInfo($select=EmployeeID,FirstName,LastName,Active)&$filter=EmployeesInfo/EmployeeID eq EmployeesInfo/EmployeeRolesInfoLines/EmployeeID and EmployeesInfo/EmployeeRolesInfoLines/RoleID eq -2 and EmployeesInfo/Active eq 'Y' &$skip=${skip}`
      );
      const employees = await clienteAxios.get(uriDecode, {
        headers: {
          Cookie: `${cookies}`,
        },
      });
      if (employees.data["odata.nextLink"]) {
        employees.data.value.map((e) => allEmployees.push(e.EmployeesInfo));
        recursiveFunct(skip + 20);
      } else {
        employees.data.value.map((e) => allEmployees.push(e.EmployeesInfo));
        res.send(allEmployees);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    const { response } = error;
    if (response && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message: response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage: response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
      });
    }
  }
};

exports.BrandAndModel = async (req, res) => {
  const cookies = req.header("Authorization");

  const { marca, modelo } = req.query;

  try {
    if (!!marca === false || !!modelo === false) {
      res
        .status(400)
        .send("Por favor, cargar marca y modelo para poder buscar un vehículo");
    } else {
      let arrayVehicles = [];
      const queryStringVehicles =
        "$crossjoin(MARCAS,Items,MODELOS)?$expand=MARCAS($select=Code,Name),MODELOS($select=Code,Name),Items($select=ItemCode,ItemName)" +
        decodeURI(
          `&$filter=(MARCAS/Code eq MODELOS/U_Marca and MARCAS/Code eq Items/U_Marca) and Items/U_Modelo eq MODELOS/Code and contains(MARCAS/Name, '${marca}') and (contains(MODELOS/Name, '${modelo}') or contains(MODELOS/Name, '${modelo.toLowerCase()}')) and (contains(Items/ItemName, '${marca}') and contains(Items/ItemName, '${modelo}'))`
        );

      const recursiveFunct = async (skip) => {
        const vehiclesResult = await clienteAxios.get(
          `/b1s/v1/${queryStringVehicles}&$skip=${skip}`,
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );

        if (vehiclesResult.data["odata.nextLink"]) {
          const formatResult = vehiclesResult.data.value.map(
            ({ MARCAS, MODELOS, Items }) => {
              const { Code, Name } = MARCAS;
              const { ItemCode, ItemName } = Items;

              return {
                U_Marca: Code,
                ItemCode,
                ItemName,
                nameBrand: Name,
                U_Modelo: MODELOS.Code,
                nameModel: MODELOS.Name,
              };
            }
          );
          arrayVehicles = [...arrayVehicles, ...formatResult];
          recursiveFunct(skip + 20);
        } else {
          const formatResult = vehiclesResult.data.value.map(
            ({ MARCAS, MODELOS, Items }) => {
              const { Code, Name } = MARCAS;
              const { ItemCode, ItemName } = Items;

              return {
                U_Marca: Code,
                ItemCode,
                ItemName,
                nameBrand: Name,
                U_Modelo: MODELOS.Code,
                nameModel: MODELOS.Name,
              };
            }
          );
          res.send([...arrayVehicles, ...formatResult]);
        }
      };
      recursiveFunct(0);
    }
  } catch (error) {
    const { response } = error;
    if (response && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message: response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage: response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
      });
    }
  }
};

exports.VehiclesInStock = async (req, res) => {
  const cookies = req.header("Authorization");

  const { WareHouse, Chasis } = req.query;

  let allVehiclesInStock = [];

  try {
    const recursiveFunct = async (skip) => {
      const uriDecode = decodeURI(
        `WhsCode eq '${WareHouse}' and contains(U_Chasis, '${Chasis}')&$skip=${skip}`
      );
      const resultVehiclesInStock = await clienteAxios.get(
        "/b1s/v1/sml.svc/YUH_STOCKVEHICULO?$filter= " + uriDecode,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );

      if (!!resultVehiclesInStock.data["@odata.nextLink"]) {
        allVehiclesInStock = [
          ...allVehiclesInStock,
          ...resultVehiclesInStock.data.value,
        ];
        recursiveFunct(skip + 20);
      } else {
        allVehiclesInStock = [
          ...allVehiclesInStock,
          ...resultVehiclesInStock.data.value,
        ];
        res.send(allVehiclesInStock);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    const { response } = error;
    console.log(error);
    if (response && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message: response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage: response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
      });
    }
  }
};

exports.BusqArticulo = async (req, res) => {
  const cookies = req.header("Authorization");
  const { CodArticulo, ItemName } = req.query;
  let allArticulos = [];

  if (CodArticulo && !ItemName) {
    try {
      const recursiveFunct = async () => {
        try {
          const resultArticulos = await clienteAxios.get(
            "/b1s/v1/Items('" + CodArticulo + "')",
            {
              headers: {
                Cookie: `${cookies}`,
              },
            }
          );
          allArticulos = [...allArticulos, resultArticulos.data];
          res.send(allArticulos);
        } catch (error) {
          res.send({ error: "No se a encontrado dicho producto", status: 400 });
        }
      };
      recursiveFunct(0);
    } catch (error) {
      const { response, status } = error;
      console.log(response);
      if (response === undefined || status === undefined) {
        res.status(403).send({ error: "No se encontro dicho producto" });
      }
      if (response && response.data.error.code === 301) {
        res.status(response.data.error.code).send({
          message: response.data.error.message.value,
        });
      } else {
        res.send({
          errorMessage: response.data.error.message.value,
          message: "Ocurrió un error, por favor vuelve a intenter",
        });
      }
    }
  } else if (!CodArticulo && ItemName) {
    try {
      const recursiveFunct = async (skip) => {
        try {
          const uriDecode = decodeURI(
            `contains(ItemName, '${ItemName}')&$skip=${skip}`
          );
          const resultArticulos = await clienteAxios.get(
            `/b1s/v1/Items?$filter=${uriDecode}`,
            {
              headers: {
                Cookie: `${cookies}`,
              },
            }
          );
          console.log(resultArticulos);
          allArticulos = [...allArticulos, resultArticulos.data];
          res.send(allArticulos);
        } catch (error) {
          res.send({ error: "No se a encontrado dicho producto", status: 400 });
        }
      };
      recursiveFunct(0);
    } catch (error) {
      const { response, status } = error;
      console.log(response);
      if (response === undefined || status === undefined) {
        res.status(403).send({ error: "No se encontro dicho producto" });
      }
      if (response && response.data.error.code === 301) {
        res.status(response.data.error.code).send({
          message: response.data.error.message.value,
        });
      } else {
        res.send({
          errorMessage: response.data.error.message.value,
          message: "Ocurrió un error, por favor vuelve a intenter",
        });
      }
    }
  }
};

exports.ServiceCallOriginsV1 = async (req, res) => {
  const cookies = req.header("Authorization");
  const { conditions } = req.query;

  try {
    const result = await clienteAxios.get(
      decodeURI(
        `/b1s/v1/ServiceCallOrigins?$filter=startswith(Description,'${conditions}')`
      ),
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    res.send(result.data.value);
  } catch (error) {
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.ServiceCallProblemTypesV1 = async (req, res) => {
  const cookies = req.header("Authorization");

  const { conditions } = req.query;

  try {
    const result = await clienteAxios.get(
      `/b1s/v1/ServiceCallProblemTypes?$filter=startswith(Description,'${conditions}')`,
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    res.send(result.data.value);
  } catch (error) {
    console.log(error);
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.ItemInStockHA = async (req, res) => {
  const cookies = req.header("Authorization");

  let allItems2 = [];
  const { WareHouse, ItemCode } = req.query;

  try {
    const recursiveFunct2 = async (skip) => {
      const uriDecode2 = decodeURI(
        `WhsCode eq '${WareHouse}' and ItemCode eq '${ItemCode}'&$skip=${skip}`
      );
      const result = await clienteAxios.get(
        `/b1s/v1/sml.svc/YUH_ITEMSTOCK?$filter=${uriDecode2}`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (!!result?.data["@odata.nextLink"]) {
        allItems2 = [...allItems2, ...result.data.value];
        recursiveFunct2(skip + 20);
      } else {
        allItems2 = [...allItems2, ...result.data.value];
        res.send(allItems2);
      }
    };
    recursiveFunct2(0);
  } catch (error) {
    console.log(error);
  }
};

exports.UsuarioEnEmision = async (req, res) => {
  const cookies = req.header("Authorization");
  let allItems3 = [];
  const { USER_CODE, BPLId } = req.query;
  try {
    const recursiveFunct3 = async (skip) => {
      const uriDecode3 = decodeURI(
        `USER_CODE eq '${USER_CODE}' and contains(BPLId, ${BPLId})&$skip=${skip}`
      );
      const result3 = await clienteAxios.get(
        `/b1s/v1/sml.svc/YUH_USUARIOPTOEMISION?$filter=${uriDecode3}`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (!!result3?.data["@odata.nextLink"]) {
        allItems3 = [...allItems3, ...result3.data.value];
        recursiveFunct3(skip + 20);
      } else {
        console.log(allItems3, "usuario emisor");
        allItems3 = [...allItems3, ...result3.data.value];
        res.send(allItems3);
      }
    };
    recursiveFunct3(0);
  } catch (error) {
    console.log(error);
  }
};

exports.SocioDeNegocios = async (req, res) => {
  const cookies = req.header("Authorization");
  const { CardCode } = req.query;
  let allItems4 = [];

  try {
    const recursiveFunct12 = async (skip) => {
      try {
        const uriDecode = decodeURI(`CardCode eq '${CardCode}'&$skip=${skip}`);
        const result12 = await clienteAxios.get(
          `/b1s/v1/sml.svc/YUH_CLIENTESALMACEN?$filter=${uriDecode}`,
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );
        console.log(result12.data.value);
        if (!!result12?.data["@odata.nextLink"]) {
          allItems4 = [...allItems4, ...result12.data.value];
          recursiveFunct12(skip + 20);
        } else {
          allItems4 = [...allItems4, ...result12.data.value];
          res.send(allItems4);
        }
      } catch (error) {
        res.send(error);
      }
    };
    recursiveFunct12(0);
  } catch (error) {
    console.log(error);
  }
};

exports.SpecificWarehouse = async (req, res) => {
  const cookies = req.header("Authorization");
  const { WhsCode, BPLName } = req.query;

  let allItems = [];
  try {
    const recursiveFunct = async (skip) => {
      const uriDecode2 = decodeURI(
        `WhsCode eq '${WhsCode}' and BPLName eq '${BPLName}'&$skip=${skip}`
      );
      const result = await clienteAxios.get(
        `/b1s/v1/sml.svc/YUH_ALMACENSUCU?$filter=${uriDecode2}`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (!!result.data["@odata.nextLink"]) {
        allItems = [...allItems, ...result.data.value];
        recursiveFunct(skip + 20);
      } else {
        allItems = [...allItems, ...result.data.value];
        res.send(allItems);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    console.log(error);
  }
};

exports.SeriesMotos = async (req, res) => {
  const cookies = req.header("Authorization");
  const { ItemCode, WhsCode } = req.query;
  let allItemsSM = [];
  try {
    const recursiveFunctSeriesMoto = async (skip) => {
      try {
        const uriDecodeSeriesMoto = decodeURI(
          `ItemCode eq '${ItemCode}' and WhsCode eq '${WhsCode}'&$skip=${skip}`
        );
        const resultSM = await clienteAxios.get(
          `/b1s/v1/sml.svc/YUH_SERIES_MOTOS?$select=ItemCode,ItemName,IntrSerial,Name,U_Chasis,SysSerial,U_Motor,U_Num_DNRPA,WhsCode&$filter=${uriDecodeSeriesMoto}`,
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );

        allItemsSM = [...allItemsSM, ...resultSM.data.value];
        res.send(allItemsSM);
      } catch (error) {
        res.send({ error: "No se encontro dicho producto", status: 404 });
      }
    };
    recursiveFunctSeriesMoto(0);
  } catch (error) {
    console.log(error);
  }
};

exports.CrearTransferenciaDeStock = async (req, res) => {
  const cookies = req.header("Authorization");

  const { ...rest } = req.body;

  console.log(rest);
  console.log(cookies);
  try {
    const resultCrearTransferencia = await clienteAxios.post(
      "/b1s/v1/StockTransfers",
      rest,
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    console.log(resultCrearTransferencia.data);
    res.send(resultCrearTransferencia.data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.AlmacenesSucu = async (req, res) => {
  const cookies = req.header("Authorization");
  const { BPLId } = req.query;

  let allItems = [];
  try {
    const recursiveFunct = async (skip) => {
      const uriDecode2 = decodeURI(`BPLId eq ${BPLId}&$skip=${skip}`);
      const result = await clienteAxios.get(
        `/b1s/v1/sml.svc/YUH_ALMACENSUCU?$filter=${uriDecode2}`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      if (!!result.data["@odata.nextLink"]) {
        allItems = [...allItems, ...result.data.value];
        recursiveFunct(skip + 20);
      } else {
        allItems = [...allItems, ...result.data.value];
        res.send(allItems);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    console.log(error);
  }
};

exports.ProjectsCodes = async (req, res) => {
  const cookies = req.header("Authorization");
  try {
    const uriDecodeProjectCodes = decodeURI(`Active eq 'tYES'`);
    const result = await clienteAxios.get(
      `/b1s/v1/Projects?$filter=${uriDecodeProjectCodes}`,
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    console.log(result.data);
    res.send(result.data.value);
  } catch (error) {
    console.log(error);
  }
};

exports.PostActivitiesHomeAppliance = async (req, res) => {
  const cookies = req.header("Authorization");

  const { DocEntry, CardCode } = req.body;
  console.log(req.body);

  try {
    const resultPostActivity = await clienteAxios.post(
      "/b1s/v1/Activities",
      { DocEntry, CardCode },
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    console.log(resultPostActivity.data);
    res.send(resultPostActivity.data);
  } catch (error) {
    console.log(error);
    const { response } = error;
    if (response.data.error.code && response.data.error.code === 301) {
      res.status(response.data.error.code).send({
        message:
          response.data.error.message && response.data.error.message.value,
      });
    } else {
      res.status(response.status).send({
        errorMessage:
          response.data.error.message && response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
        code: response.data.error,
      });
    }
  }
};

exports.GetActivitiesHome = async (req, res) => {
  const cookies = req.header("Authorization");
  const { ActivityCode } = req.query;
  let allItems = [];

  try {
    const recursiveFunct = async (skip) => {
      const uriDecode2 = decodeURI(
        `ActivityCode eq ${ActivityCode}&$skip=${skip}`
      );
      const result = await clienteAxios.get(
        `/b1s/v1/Activities?$filter=${uriDecode2}`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      console.log(result);
      if (!!result.data["@odata.nextLink"]) {
        allItems = [...allItems, ...result.data.value];
        recursiveFunct(skip + 20);
      } else {
        allItems = [...allItems, ...result.data.value];
        res.send(allItems);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    res.send(error);
  }
};

exports.GetTransferStock = async (req, res) => {
  const cookies = req.header("Authorization");
  const { DocEntry } = req.query;
  let allItems = [];

  try {
    const recursiveFunct = async (skip) => {
      const uriDecode2 = decodeURI(`DocEntry eq ${DocEntry}&$skip=${skip}`);
      const result = await clienteAxios.get(
        `/b1s/v1/StockTransfers?$filter=${uriDecode2}`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      console.log(result);
      if (!!result.data["@odata.nextLink"]) {
        allItems = [...allItems, ...result.data.value];
        recursiveFunct(skip + 20);
      } else {
        allItems = [...allItems, ...result.data.value];
        res.send(allItems);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    res.send(error);
  }
};

exports.CProveedor = async (req, res) => {
  const cookies = req.header("Authorization");
  const { Provee } = req.query;
  let allItems = [];

  try {
    const recursiveFunct = async (skip) => {
      try {
        const uriDecode = decodeURI(
          `FederalTaxID eq '${Provee}' or CardName eq '${Provee}'&$skip=${skip}`
        );
        const result = await clienteAxios.get(
          `/b1s/v1/BusinessPartners?$select=CardCode,CardName,Address,FederalTaxID,Cellular,City,Country,EmailAddress,DebitorAccount,HouseBankAccount,BPAddresses,BPAccountReceivablePaybleCollection,BPBranchAssignment&$filter=${uriDecode}`,
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );
        if (!!result.data["@odata.nextLink"]) {
          allItems = [...allItems, ...result.data.value];
          recursiveFunct(skip + 20);
        } else {
          allItems = [...allItems, ...result.data.value];
          res.send(allItems);
        }
      } catch (error) {
        console.log(error);
      }
    };
    recursiveFunct(0);
  } catch (error) {
    res.send(error);
  }
};

