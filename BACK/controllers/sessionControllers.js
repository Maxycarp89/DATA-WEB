const { clienteAxios } = require("../utils/clientAxios");
require("tls").DEFAULT_MIN_VERSION = "TLSv1";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let postData = {};
let cookies = {};

exports.login = async (req, res) => {
  const { UserName, Password, CompanyDB } = req.body;
  postData = {
    UserName,
    Password,
    CompanyDB,
  };
  try {
    const loginData = await clienteAxios.post("/b1s/v1/Login", postData);
    res.json(loginData.headers);
  } catch (error) {
    const { response } = error;
    if (
      response &&
      response.status === 401 &&
      response.statusText.includes("Unauthorized")
    ) {
      res.status(response.status).send({
        message: "Unauthorized",
        error: response?.data?.error.message,
      });
    } else {
      res.status(500).send({
        message: `Ocurrió un error codigo ${response.data.error?.code}`,
        error: response?.data?.error,
      });
    }
  }
};

exports.loginAgain = async (req, res) => {
  const { UserName, Password, CompanyDB } = req.body;

  let postDataReLogin = {
    UserName,
    Password,
    CompanyDB,
  };

  try {
    console.log("bodyReLogin", postDataReLogin);

    const loginData = await clienteAxios.post("/b1s/v1/Login", postDataReLogin);
    res.json(loginData.headers);
  } catch (error) {
    const { response } = error;
    console.log(response);
    if (
      response &&
      response.status === 401 &&
      response.statusText.includes("Unauthorized")
    ) {
      res
        .status(response.status)
        .send({ message: "Unauthorized", error: response.data.error.message });
    } else {
      res.status(500).send({
        message: `Ocurrió un error codigo ${response.data.error.code}`,
        error: response.data.error,
      });
    }
  }
};

exports.users = async (req, res) => {
  cookies = req.header("Authorization");
  console.log("CookiesUsers", cookies);
  const { user, InternalKey } = req.query;

  const allBPlaces = [];

  let queryStringBLPID = "";

  try {
    if (!!InternalKey) {
      const userName = await clienteAxios.get(
        `/b1s/v1/Users(${InternalKey})?$select=UserName`,
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );
      res.send(userName.data);
    } else if (!!InternalKey === false) {
      const userData = await clienteAxios.get(
        "/b1s/v1/Users?$filter=UserCode" + decodeURI(` eq '${user}'`),
        {
          headers: {
            Cookie: `${cookies}`,
          },
        }
      );

      if (userData.data.value.length > 0) {
        const userBranchOffice = await clienteAxios.get(
          `/b1s/v1/Users(${userData.data.value[0].InternalKey})`,
          {
            headers: {
              Cookie: `${cookies}`,
            },
          }
        );
        if (userBranchOffice.data.UserBranchAssignment.length > 0) {
          const getWarehouse = async (skip) => {
            const userWareHouse = await clienteAxios.get(
              "/b1s/v1//sml.svc/YUH_SUCUSUARIO?$filter=USER_CODE" +
                decodeURI(` eq '${user}'`) +
                `&$skip=${skip}`,
              {
                headers: {
                  Cookie: `${cookies}`,
                },
              }
            );
            if (userWareHouse.data["@odata.nextLink"]) {
              userWareHouse.data.value.map((data) => allBPlaces.push(data));
              getWarehouse(skip + 20);
            } else {
              userWareHouse.data.value.map((data) => allBPlaces.push(data));
              const user = userData.data.value[0].InternalKey;
              const wareHouse = allBPlaces;
              res.send({ wareHouse, user });
            }
          };
          getWarehouse(0);
        } else {
          const userBranch = userBranchOffice.data;
          res.send({ userBranch, user: userData.data.value[0].InternalKey });
        }
      }
    }
  } catch (error) {
    const { response } = error;
    console.log(response);
    if (
      response &&
      response.status === 401 &&
      response.statusText.includes("Unauthorized")
    ) {
      res
        .status(response.status)
        .send({ message: "Unauthorized", error: response.data.error.message });
    } else {
      res.status(response.status).send({
        message: `Ocurrió un error codigo ${response.data.error.code}`,
        error: response.data.error,
      });
    }
  }
};

exports.logout = async (req, res) => {
  req.header("Authorization");
  console.log("CookiesLogOut", cookies);

  try {
    await clienteAxios.post("/b1s/v1/Logout", {
      headers: {
        Cookie: `${cookies}`,
      },
    });
    res.send({ message: "Logout Succesfully" });
  } catch (error) {
    const { response } = error;
    res.status(500).send({
      message: "Ocurrió un error y no pudimos cerrar tu sesión",
      error: response.data.error.message,
    });
  }
};

exports.NewClient = async (req, res) => {
  const postDataNew = {
    CompanyDB: "YUHMAKSA_TEST",
    Password: "2022",
    UserName: "llamadaservicio",
  };
  try {
    const loginDataNew = await clienteAxios.post("/b1s/v1/Login", postDataNew);
    res.json(loginDataNew.headers);
  } catch (error) {
    const { response } = error;
    res.status(500).send({
      message: "Ocurrió un error y no pudimos cerrar tu sesión",
      error: response,
    });
  }
};

exports.almacenes = async (req, res) => {
  const cookies = req.header("Authorization");

  const { BPLID } = req.query;

  try {
    const result = await clienteAxios.get(
      "/b1s/v1/Warehouses?$filter=BusinessPlaceID" +
        decodeURI(
          ` eq ${BPLID}` + "and U_DepIntermSuc eq 'N' and Inactive eq 'tNO'"
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

exports.changePassword = async (req, res) => {
  const cookies = req.header("Authorization");
  const { newPassword, userID } = req.body;
  try {
    await clienteAxios.patch(
      `/b1s/v1/Users(${userID})`,
      { UserPassword: newPassword },
      {
        headers: {
          Cookie: `${cookies}`,
        },
      }
    );
    res.send({ message: "Contraseña cambiada con Éxisto" });
  } catch (error) {
    const { response } = error;
    console.log(response.data);
    if (response && response.data.error?.code === 301) {
      res
        .status(response.data.error?.code)
        .send({ message: response.data.error.message.value });
    } else {
      res.status(response.status).send({
        errorMessage: response.data.error.message.value,
        message: "Ocurrió un error, por favor vuelve a intenter",
      });
    }
  }
};
