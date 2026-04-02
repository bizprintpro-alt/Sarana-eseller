const mongoose = require('mongoose');

// Global + category-based commission rates
const commissionSchema = new mongoose.Schema({
  type: { type: String, enum: ['global', 'category'], required: true },
  category: { type: String }, // only for type='category'

  seller:    { type: Number, required: true, min: 0, max: 100 },
  affiliate: { type: Number, required: true, min: 0, max: 100 },
  platform:  { type: Number, required: true, min: 0, max: 100 },
  delivery:  { type: Number, required: true, min: 0, max: 100 },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

commissionSchema.index({ type: 1, category: 1 }, { unique: true });

// Default global rates
commissionSchema.statics.getGlobal = async function() {
  let rates = await this.findOne({ type: 'global' });
  if (!rates) {
    rates = await this.create({
      type: 'global', seller: 70, affiliate: 15, platform: 10, delivery: 5,
    });
  }
  return rates;
};

// Get rates for a specific category (fallback to global)
commissionSchema.statics.getRatesForCategory = async function(category) {
  const catRates = await this.findOne({ type: 'category', category });
  if (catRates) return catRates;
  return this.getGlobal();
};

module.exports = mongoose.model('Commission', commissionSchema);
