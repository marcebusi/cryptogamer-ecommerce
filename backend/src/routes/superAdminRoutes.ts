import { Router } from 'express'
import { authenticate, requireSuperAdmin } from '../middleware/auth'
import {
  getOverview, getUsers, updateUserRole,
  resetUserPassword, deleteUser,
  getStoreConfig, updateStoreConfig,
  getEnabledSections,
  getBillingConfig, updateBillingConfig,
  getServicePayments, createServicePayment,
  markPaymentStatus, getBillingStatus,
} from '../controllers/superAdminController'

const router = Router()

// Accessible by any authenticated admin
router.get('/sections',       authenticate, getEnabledSections)
router.get('/billing-status', authenticate, getBillingStatus)

// Everything else requires superadmin
router.use(authenticate, requireSuperAdmin)

router.get('/overview',              getOverview)
router.get('/users',                 getUsers)
router.put('/users/:id/role',        updateUserRole)
router.put('/users/:id/password',    resetUserPassword)
router.delete('/users/:id',          deleteUser)
router.get('/store',                 getStoreConfig)
router.put('/store',                 updateStoreConfig)

// Billing
router.get('/billing',                        getBillingConfig)
router.put('/billing',                        updateBillingConfig)
router.get('/billing/payments',               getServicePayments)
router.post('/billing/payments',              createServicePayment)
router.patch('/billing/payments/:id/status',  markPaymentStatus)

export default router
