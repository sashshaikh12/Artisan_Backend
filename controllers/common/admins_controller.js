const Admin = require('../../models/User');

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: 'admin' });

    if (!admins || admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admins found.',
      });
    }

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (err) {
    console.error('Error fetching admins:', err.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = getAllAdmins;
