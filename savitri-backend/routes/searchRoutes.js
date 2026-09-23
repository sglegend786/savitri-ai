const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// --- Haversine formula to calculate real distance in km ---
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Check if pharmacy is open right now ---
function isPharmacyOpen(openingTime, closingTime) {
  if (!openingTime || !closingTime) return true;
  const now = new Date();
  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  return nowMins >= openMins && nowMins < closeMins;
}

// --- Best Match Score algorithm (configurable weights) ---
function calcBestMatchScore(priceScore, distanceScore, availScore, ratingScore) {
  // Weights (must sum to 1)
  const W_PRICE = 0.40;
  const W_DISTANCE = 0.30;
  const W_AVAIL = 0.20;
  const W_RATING = 0.10;
  return (
    W_PRICE * priceScore +
    W_DISTANCE * distanceScore +
    W_AVAIL * availScore +
    W_RATING * ratingScore
  );
}

// @route   POST /api/search/prescription
// @desc    Upload & analyze prescription (AI detection mock)
// @access  Public
router.post('/prescription', async (req, res) => {
  res.status(200).json({
    message: 'Prescription analyzed successfully',
    extractedMedicines: [
      { medicineName: 'Paracetamol', strength: '500mg', dosage: '1 tablet', quantity: 10, frequency: 'Twice a day' },
      { medicineName: 'Amoxicillin', strength: '250mg', dosage: '1 capsule', quantity: 15, frequency: 'Thrice a day' }
    ]
  });
});

// @route   POST /api/search/match-prescription-text
// @desc    Match raw OCR text to medicines
// @access  Public
router.post('/match-prescription-text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'No text provided' });
    }

    // Extract words, remove short words (length < 4) and common stop words
    const words = text.match(/\b[a-zA-Z]{4,}\b/g) || [];
    const lowerWords = words.map(w => w.toLowerCase());
    const stopWords = ['this', 'that', 'with', 'from', 'your', 'have', 'tablet', 'capsule', 'mg', 'ml', 'take', 'daily', 'date', 'name', 'age'];
    const filteredWords = lowerWords.filter(w => !stopWords.includes(w));

    if (filteredWords.length === 0) {
      return res.status(200).json([]);
    }

    // Find medicines where medicineName matches any of the words
    const matchedMedicines = await Medicine.find({
      medicineName: { $in: filteredWords.map(w => new RegExp(w, 'i')) }
    });

    // We want unique medicines by name, and format them as required
    const uniqueNames = new Set();
    const result = [];

    matchedMedicines.forEach(med => {
      const name = med.medicineName.trim().toLowerCase();
      if (!uniqueNames.has(name)) {
        uniqueNames.add(name);
        result.push({
          id: med._id,
          name: med.medicineName,
          strength: med.strength || 'N/A',
          dosage: med.dosageForm || 'N/A',
          quantity: 10, // Default values for the UI
          frequency: 'As prescribed'
        });
      }
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/search/medicines
// @desc    Search medicines globally across pharmacies by name
// @access  Public
router.get('/medicines', async (req, res) => {
  try {
    const { query } = req.query;
    const medicines = await Medicine.find({
      $or: [
        { medicineName: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } }
      ]
    }).populate('pharmacyId', 'pharmacyName location rating isOpen');
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/search/nearby-pharmacies
// @desc    Find nearby pharmacies with real distance calculation
// @access  Public
router.get('/nearby-pharmacies', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [userLng, userLat] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    // Enrich each pharmacy with real distance + open status
    const enriched = pharmacies.map((p) => {
      const pLat = p.location.coordinates[1];
      const pLng = p.location.coordinates[0];
      const distKm = haversineDistance(userLat, userLng, pLat, pLng);
      const open = isPharmacyOpen(p.openingTime, p.closingTime);
      return {
        ...p.toObject(),
        distanceKm: parseFloat(distKm.toFixed(2)),
        distanceLabel: distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)} km`,
        isOpenNow: open
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/search/compare-prices
// @desc    Compare medicine prices with Best Match algorithm
// @access  Public
router.get('/compare-prices', async (req, res) => {
  try {
    const { medicineName, lng, lat, maxDistance = 10000 } = req.query;

    if (!medicineName || !lng || !lat) {
      return res.status(400).json({ message: 'Medicine name, longitude, and latitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // 1. Find nearby pharmacies
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [userLng, userLat] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    const pharmacyIds = nearbyPharmacies.map((p) => p._id);

    // 2. Find the medicine in those pharmacies
    const medicines = await Medicine.find({
      medicineName: { $regex: new RegExp(medicineName, 'i') },
      pharmacyId: { $in: pharmacyIds },
      availability: { $in: ['In Stock', 'Low Stock'] }
    }).populate('pharmacyId', 'pharmacyName rating location openingTime closingTime pharmacyPhone address verificationStatus slug');

    let substitutes = [];
    let genName = null;
    if (medicines.length > 0 && medicines[0].genericName) {
      genName = medicines[0].genericName;
    } else {
      // Try to find the generic name globally
      const globMed = await Medicine.findOne({ medicineName: { $regex: new RegExp(`^${medicineName}$`, 'i') } });
      if (globMed && globMed.genericName) genName = globMed.genericName;
    }

    if (genName) {
      substitutes = await Medicine.find({
        genericName: genName,
        medicineName: { $not: new RegExp(`^${medicineName}$`, 'i') }
      }).sort({ price: 1 }).populate('pharmacyId', 'pharmacyName location rating');
    }

    if (medicines.length === 0) {
      return res.status(200).json({ bestPrice: null, nearest: null, bestMatch: null, comparisons: [], substitutes });
    }

    // 3. Enrich with real distance + open status
    const maxPrice = Math.max(...medicines.map((m) => m.price));
    const minPrice = Math.min(...medicines.map((m) => m.price));

    const enriched = medicines.map((med) => {
      const pLat = med.pharmacyId.location.coordinates[1];
      const pLng = med.pharmacyId.location.coordinates[0];
      const distKm = haversineDistance(userLat, userLng, pLat, pLng);
      const open = isPharmacyOpen(med.pharmacyId.openingTime, med.pharmacyId.closingTime);

      // Normalize scores 0–1 (higher = better)
      const priceScore = maxPrice === minPrice ? 1 : 1 - (med.price - minPrice) / (maxPrice - minPrice);
      const distanceScore = distKm < 0.1 ? 1 : Math.max(0, 1 - distKm / 20); // 20km max scale
      const availScore = med.availability === 'In Stock' ? 1 : 0.5;
      const ratingScore = (med.pharmacyId.rating || 0) / 5;

      const bestMatchScore = calcBestMatchScore(priceScore, distanceScore, availScore, ratingScore);
      const reliabilityScore = Math.floor(85 + (med.pharmacyId.rating || 4) * 2 + Math.random() * 5);

      return {
        _id: med._id,
        pharmacyId: med.pharmacyId,
        medicineName: med.medicineName,
        brandName: med.brandName,
        genericName: med.genericName,
        strength: med.strength,
        dosageForm: med.dosageForm,
        packSize: med.packSize,
        price: med.price,
        stockQuantity: med.stockQuantity,
        availability: med.availability,
        distanceKm: parseFloat(distKm.toFixed(2)),
        distanceLabel: distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)} km`,
        isOpenNow: open,
        bestMatchScore: parseFloat(bestMatchScore.toFixed(4)),
        priceScore: parseFloat(priceScore.toFixed(4)),
        distanceScore: parseFloat(distanceScore.toFixed(4)),
        reliabilityScore
      };
    });

    // 4. Sort sections
    const byPrice = [...enriched].sort((a, b) => a.price - b.price);
    const byDistance = [...enriched].sort((a, b) => a.distanceKm - b.distanceKm);
    const byBestMatch = [...enriched].sort((a, b) => b.bestMatchScore - a.bestMatchScore);

    res.status(200).json({
      bestPrice: byPrice[0] || null,
      nearest: byDistance[0] || null,
      bestMatch: byBestMatch[0] || null,
      byPrice,
      byDistance,
      comparisons: byBestMatch, // default sort = best match
      substitutes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
