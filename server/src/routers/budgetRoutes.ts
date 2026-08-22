import { Router } from "express";
import {
  updateTripBudget,
  getTripBudget,
  createExpense,
  getTripExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

// Budget summary & updates
router.get("/:tripId", getTripBudget);
router.put("/:tripId", verifyUser, updateTripBudget);

// Expenses sub-resource
router.post("/:tripId/expenses", verifyUser, createExpense);
router.get("/:tripId/expenses", verifyUser, getTripExpenses);

// Expense resource operations
router.get("/expenses/:id", verifyUser, getExpenseById);
router.put("/expenses/:id", verifyUser, updateExpense);
router.delete("/expenses/:id", verifyUser, deleteExpense);

export default router;

