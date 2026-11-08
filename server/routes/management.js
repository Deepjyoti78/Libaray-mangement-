import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { applyRecordChanges, listRecords, getReports } from '../services/managementService.js';

const router = express.Router();
router.use(requireAuth);
router.get('/reports', async (req, res, next) => {
  try { res.json(await getReports()); } catch (error) { next(error); }
});
router.use('/manage/staff', requireRole('admin'));
router.get('/manage/:collection', async (req, res, next) => {
  try { res.json({ items: await listRecords(req.params.collection) }); } catch (error) { next(error); }
});
router.post('/manage/:collection/changes', async (req, res) => {
  try {
    res.json({ items: await applyRecordChanges(req.params.collection, req.body.changes, req.user) });
  } catch (error) {
    const message = error.code === '23505' ? 'A record with this email, ISBN, or reference already exists.' : error.message;
    res.status(error.status || 400).json({ error: message });
  }
});
export default router;
