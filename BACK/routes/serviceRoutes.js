const express = require("express");
const router = express.Router();
const serviceControllers = require("../controllers/serviceControllers");
const InternalVehicle = require("../controllers/services/InternalVehicle");
const utilsControllers = require("../controllers/utils.Controllers");

// GET
router.get("/EmployeesInfo", serviceControllers.EmployeesInfo);
router.get("/ServiceCalls", serviceControllers.ServiceCalls);
router.get("/ServiceCallOrigins", serviceControllers.ServiceCallOrigins);
router.get("/ServiceCallTypes", serviceControllers.ServiceCallTypes);
router.get(
  "/ServiceCallProblemTypes",
  serviceControllers.ServiceCallProblemTypes
);
router.get(
  "/ServiceCallProblemSubTypes",
  serviceControllers.ServiceCallProblemSubTypes
);
router.get("/Items", serviceControllers.GetItems);
router.get("/Activities", serviceControllers.GetActivities);
router.get("/BrandAndModel", serviceControllers.BrandAndModel);
router.get("/InternalVehicle", InternalVehicle.getInternalVehicles);
router.get("/Combos", utilsControllers.getCombos);
router.get("/CombosQuantity", utilsControllers.getCombosOpen);
router.get("/CombosQuantityI", utilsControllers.getCombosOpenI);
router.get("/vehiclesInStock", serviceControllers.VehiclesInStock);
router.get("/busqArticulo", serviceControllers.BusqArticulo);
router.get("/GetActivityHome", serviceControllers.GetActivitiesHome);
router.get("/GetTransferStock", serviceControllers.GetTransferStock);
router.get("/CodigoProveedor", serviceControllers.CProveedor);

//! GET V1
router.get("/CallOriginsV1", serviceControllers.ServiceCallOriginsV1);
router.get(
  "/ServiceCallProblemTypesV1",
  serviceControllers.ServiceCallProblemTypesV1
);
router.get("/WarehouseByBLPID", serviceControllers.AlmacenesSucu);
router.get("/SpecificWarehouse", serviceControllers.SpecificWarehouse);
router.get("/StockHA", serviceControllers.ItemInStockHA);
router.get("/UsuarioPtoEmision", serviceControllers.UsuarioEnEmision);
router.get("/SocioDeNegocios", serviceControllers.SocioDeNegocios);
router.get("/SeriesMotos", serviceControllers.SeriesMotos);
router.get("/ProjectsCodes", serviceControllers.ProjectsCodes);

// POST
router.post("/ServiceCalls", serviceControllers.PostServiceCalls);
router.post("/InventoryGenExits", serviceControllers.PostInventoryGenExits);
router.post("/Activities", serviceControllers.PostActivities);
router.post("/PostEntregaCS", serviceControllers.PostEntregaCS);
router.post(
  "/TransferenciaDeStock",
  serviceControllers.CrearTransferenciaDeStock
);
router.post("/ActivitiesHome", serviceControllers.PostActivitiesHomeAppliance);

// PATCH
router.patch("/ServiceCalls", serviceControllers.EditServiceCalls);

module.exports = router;
