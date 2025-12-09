const Airport = require('../models/Airport');

const createAirport = async (req, res) => {
  try {
    const { name, iata, city, country, latitude, longitude, timezone } = req.body;

    const existingAirport = await Airport.findOne({ iata: iata.toUpperCase() });
    if (existingAirport) {
      return res.status(409).json({ message: 'Airport with this IATA code already exists' });
    }

    const airport = new Airport({
      name,
      iata: iata.toUpperCase(),
      city,
      country,
      latitude,
      longitude,
      timezone,
    });

    await airport.save();
    res.status(201).json({ message: 'Airport created', airport });
  } catch (error) {
    res.status(500).json({ message: 'Error creating airport', error: error.message });
  }
};

const getAirports = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { iata: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const airports = await Airport.find(query).limit(50);
    res.json(airports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching airports', error: error.message });
  }
};

const getAirportById = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }
    res.json(airport);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching airport', error: error.message });
  }
};

const updateAirport = async (req, res) => {
  try {
    const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }
    res.json({ message: 'Airport updated', airport });
  } catch (error) {
    res.status(500).json({ message: 'Error updating airport', error: error.message });
  }
};

const deleteAirport = async (req, res) => {
  try {
    const airport = await Airport.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }
    res.json({ message: 'Airport deleted', airport });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting airport', error: error.message });
  }
};

module.exports = {
  createAirport,
  getAirports,
  getAirportById,
  updateAirport,
  deleteAirport,
};
