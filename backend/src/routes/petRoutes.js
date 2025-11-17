import express from "express";
import { 
  createPet, 
  getUserPets, 
  updatePet, 
  deletePet 
} from "../controllers/petController.js";
import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/", protect, createPet);
router.get("/", protect, getUserPets);
router.put("/:id", protect, updatePet);
router.delete("/:id", protect, deletePet);

export default router;
