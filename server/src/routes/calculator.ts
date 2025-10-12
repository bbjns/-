import { Router } from 'express';
import { calculate, getCalculationHistory } from '../controllers/calculatorController';
import { validateCalculatorInput } from '../middleware/validation';
import { optionalAuth, authenticate } from '../middleware/auth';

const router = Router();

// 计算接口（可选认证）
router.post('/calculate', optionalAuth, validateCalculatorInput, calculate);

// 获取计算历史（需要认证）
router.get('/history', authenticate, getCalculationHistory);

export default router;