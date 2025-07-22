import { Router } from 'express';
import { createProduct, deleteProduct, getCurrentLocation, 
    getManufacturerDetails, getProductById,
    markProductAsDamaged,
    updateProductDetails,
    updateProductStatus} from '../controllers/product.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/createProduct', verifyJWT, createProduct);
router.get('/c/:productId', verifyJWT, getProductById);
router.get('/c/:productId/manufacturer', verifyJWT, getManufacturerDetails)
router.get('/c/:productId/currentLocation', verifyJWT, getCurrentLocation)
router.patch('/c/:productId/updateProductStatus', verifyJWT, updateProductStatus)
router.patch('/c/:productId/updateProductDetails', verifyJWT, updateProductDetails);
router.patch('/c/:productId/recall', verifyJWT, markProductAsDamaged);
router.delete('/c/:productId/delete', verifyJWT, deleteProduct);

export default router;