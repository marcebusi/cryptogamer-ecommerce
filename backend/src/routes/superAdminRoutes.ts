import { Router } from 'express'
import { authenticate, requireSuperAdmin } from '../middleware/auth'
import {
  getOverview, getUsers, updateUserRole,
  resetUserPassword, deleteUser,
  getStoreConfig, updateStoreConfig,
} from '../controllers/superAdminController'

const router = Router()

router.use(authenticate, requireSuperAdmin)

router.get('/overview',              getOverview)
router.get('/users',                 getUsers)
router.put('/users/:id/role',        updateUserRole)
router.put('/users/:id/password',    resetUserPassword)
router.delete('/users/:id',          deleteUser)
router.get('/store',                 getStoreConfig)
router.put('/store',                 updateStoreConfig)

export default router
