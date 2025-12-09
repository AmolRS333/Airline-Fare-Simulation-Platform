const Airline = require('../models/Airline');

const createAirline = async (req, res) => {
  try {
    const { name, code, country, website, logo } = req.body;

    const existingAirline = await Airline.findOne({ code: code.toUpperCase() });
    if (existingAirline) {
      return res.status(409).json({ message: 'Airline with this code already exists' });
    }

    const airline = new Airline({
      name,
      code: code.toUpperCase(),
      country,
      website,
      logo,
    });

    await airline.save();
    res.status(201).json({ message: 'Airline created', airline });
  } catch (error) {
    res.status(500).json({ message: 'Error creating airline', error: error.message });
  }
};

const getAirlines = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const airlines = await Airline.find(query).limit(50);
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching airlines', error: error.message });
  }
};

const getAirlineById = async (req, res) => {
  try {
    const airline = await Airline.findById(req.params.id);
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.json(airline);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching airline', error: error.message });
  }
};

const updateAirline = async (req, res) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.json({ message: 'Airline updated', airline });
  } catch (error) {
    res.status(500).json({ message: 'Error updating airline', error: error.message });
  }
};

const deleteAirline = async (req, res) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.json({ message: 'Airline deleted', airline });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting airline', error: error.message });
  }
};

module.exports = {
  createAirline,
  getAirlines,
  getAirlineById,
  updateAirline,
  deleteAirline,
};
