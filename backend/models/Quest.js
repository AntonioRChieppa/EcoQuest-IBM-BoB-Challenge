const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const Quest = sequelize.define('Quest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // 'daily' | 'weekly'
    allowNull: false,
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING, // 'active' | 'completed'
    defaultValue: 'active',
  },
});

// Associations
User.hasMany(Quest, { foreignKey: 'user_id' });
Quest.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Quest;
