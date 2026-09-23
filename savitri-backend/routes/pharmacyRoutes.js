const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/pharmacies/my-pharmacy
// @desc    Get logged in owner's pharmacy
// @access  Private
router.get('/my-pharmacy', protect, authorize('pharmacy_owner'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found for this user' });
    }
    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pharmacies/dashboard/analytics
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard/analytics', protect, authorize('pharmacy_owner'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.id });
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    
    const pharmacyId = pharmacy._id;
    
    const totalMedicines = await Medicine.countDocuments({ pharmacyId });
    const inStockMedicines = await Medicine.countDocuments({ pharmacyId, stockQuantity: { $gt: 10 } });
    const lowStockMedicines = await Medicine.countDocuments({ pharmacyId, stockQuantity: { $gt: 0, $lte: 10 } });
    const outOfStockMedicines = await Medicine.countDocuments({ pharmacyId, stockQuantity: { $lte: 0 } });
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysReservations = await Reservation.countDocuments({ 
      pharmacyId, 
      createdAt: { $gte: startOfToday } 
    });
    
    const pendingRequests = await Reservation.countDocuments({ pharmacyId, reservationStatus: 'Pending' });
    const confirmedReservations = await Reservation.countDocuments({ pharmacyId, reservationStatus: 'Accepted' });
    const completedReservations = await Reservation.countDocuments({ pharmacyId, reservationStatus: 'Completed' });

    // Mock data for charts
    const revenueData = [
      { date: 'Mon', revenue: 400 },
      { date: 'Tue', revenue: 300 },
      { date: 'Wed', revenue: 550 },
      { date: 'Thu', revenue: 700 },
      { date: 'Fri', revenue: 650 },
      { date: 'Sat', revenue: 800 },
      { date: 'Sun', revenue: 950 }
    ];

    const popularMedicines = [
      { name: 'Paracetamol', sales: 45 },
      { name: 'Amoxicillin', sales: 30 },
      { name: 'Ibuprofen', sales: 25 },
      { name: 'Cetirizine', sales: 15 },
      { name: 'Omeprazole', sales: 10 }
    ];

    // Get actual low stock alerts from database
    const lowStockAlerts = await Medicine.find({ pharmacyId, stockQuantity: { $gt: 0, $lte: 10 } }).select('name stockQuantity').limit(5);

    res.status(200).json({ 
      totalMedicines, 
      inStockMedicines, 
      lowStockMedicines, 
      outOfStockMedicines, 
      todaysReservations, 
      pendingRequests,
      confirmedReservations,
      completedReservations,
      charts: {
        revenueData,
        popularMedicines,
        lowStockAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/pharmacies/slug/:slug
// @desc    Get pharmacy by slug (Public page)
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ slug: req.params.slug }).lean();
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    
    // Also fetch medicines for this pharmacy
    const medicines = await Medicine.find({ pharmacyId: pharmacy._id });
    pharmacy.medicines = medicines;
    
    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/pharmacies
// @desc    Get all pharmacies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({});
    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/pharmacies/:id
// @desc    Update a pharmacy profile
// @access  Private (Pharmacy Owners)
router.put('/:id', protect, authorize('pharmacy_owner'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found or unauthorized' });

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
