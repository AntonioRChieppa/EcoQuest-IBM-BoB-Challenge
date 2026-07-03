const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  xp_total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // XP within the current level only — resets to overflow on level-up
  xp_current_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rpg_class: {
    type: DataTypes.STRING,
    defaultValue: 'Recluta Inquinante',
  },
  // Generate-quest rate limiter: counts how many times called today
  quest_generates_today: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // ISO date string (YYYY-MM-DD) of the last generate call
  quest_generates_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

module.exports = User;
