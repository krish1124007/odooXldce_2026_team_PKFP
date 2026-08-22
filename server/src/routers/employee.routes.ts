import { Router } from "express";
import { 
    createEmployee, 
    getEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee,
    createDepartment,
    getDepartments
} from "../controllers/employee.controller.js";

const router = Router();

// Employee routes
router.post("/employees", createEmployee);
router.get("/employees", getEmployees);
router.get("/employees/:id", getEmployeeById);
router.put("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);

// Department routes
router.post("/departments", createDepartment);
router.get("/departments", getDepartments);

export default router;
