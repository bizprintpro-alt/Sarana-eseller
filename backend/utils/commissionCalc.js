const Commission = require('../models/Commission');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const AffiliateClick = require('../models/AffiliateClick');

/**
 * Захиалга амжилттай төлбөр хийгдсэний дараа комисс тооцоолох
 *
 * Урсгал:
 * 1. Захиалгын категориар комиссын хувь авах
 * 2. Seller-д хуваарилах (product.commission override байвал ашиглах)
 * 3. Affiliate байвал комисс олгох
 * 4. Platform + Delivery хувь тооцох
 * 5. Wallet-д орлого нэмэх
 * 6. AffiliateClick → converted=true гэж тэмдэглэх
 */
async function calculateCommissions(order) {
  if (order.commissions?.calculated) return order;

  const total = order.total || 0;
  if (total <= 0) return order;

  // Get commission rates
  const category = order.items?.[0]?.product?.category || 'other';
  const rates = await Commission.getRatesForCategory(category);

  // Check if affiliate involved
  let affiliateUser = null;
  if (order.referralCode) {
    affiliateUser = await User.findOne({
      $or: [
        { username: order.referralCode },
        { _id: order.referralCode.match(/^[0-9a-fA-F]{24}$/) ? order.referralCode : null },
      ],
      role: 'affiliate',
    });
  }

  // Calculate amounts
  const sellerPct    = rates.seller;
  const affiliatePct = affiliateUser ? rates.affiliate : 0;
  const platformPct  = rates.platform + (affiliateUser ? 0 : rates.affiliate); // affiliate хувь нь platform-д ордог
  const deliveryPct  = rates.delivery;

  const commissions = {
    seller:     Math.round(total * sellerPct / 100),
    affiliate:  Math.round(total * affiliatePct / 100),
    platform:   Math.round(total * platformPct / 100),
    delivery:   Math.round(total * deliveryPct / 100),
    calculated: true,
  };

  // Per-product commission override (seller тохируулсан бол)
  // Product.commission нь affiliate-д өгөх хувь
  if (affiliateUser && order.items?.length) {
    let totalAffComm = 0;
    for (const item of order.items) {
      if (item.product?.commission) {
        const itemTotal = (item.price || item.product.price || 0) * (item.quantity || 1);
        totalAffComm += Math.round(itemTotal * item.product.commission / 100);
      }
    }
    if (totalAffComm > 0) {
      commissions.affiliate = totalAffComm;
      commissions.seller = total - totalAffComm - commissions.platform - commissions.delivery;
    }
  }

  // Update order
  order.commissions = commissions;
  if (affiliateUser) order.affiliate = affiliateUser._id;
  await order.save();

  // Credit wallets
  // Seller wallet
  const sellerProduct = order.items?.[0]?.product;
  if (sellerProduct?.seller) {
    const sellerWallet = await Wallet.getOrCreate(sellerProduct.seller);
    sellerWallet.pending += commissions.seller;
    sellerWallet.transactions.push({
      type: 'earn', amount: commissions.seller,
      orderId: order._id, note: `Захиалга #${order.orderNumber}`,
      status: 'pending',
    });
    await sellerWallet.save();
  }

  // Affiliate wallet
  if (affiliateUser && commissions.affiliate > 0) {
    const affWallet = await Wallet.getOrCreate(affiliateUser._id);
    affWallet.pending += commissions.affiliate;
    affWallet.transactions.push({
      type: 'earn', amount: commissions.affiliate,
      orderId: order._id, note: `Affiliate комисс #${order.orderNumber}`,
      status: 'pending',
    });
    await affWallet.save();

    // Mark click as converted
    await AffiliateClick.updateMany(
      { referralCode: order.referralCode, converted: false },
      { converted: true, orderId: order._id }
    );
  }

  return order;
}

/**
 * Захиалга delivered болоход pending → balance руу шилжүүлэх
 */
async function confirmEarnings(order) {
  if (!order.commissions?.calculated) return;

  const updates = [];

  // Seller
  const sellerProduct = order.items?.[0]?.product;
  if (sellerProduct?.seller) {
    updates.push(Wallet.findOneAndUpdate(
      { user: sellerProduct.seller },
      {
        $inc: { balance: order.commissions.seller, pending: -order.commissions.seller },
        $set: { 'transactions.$[t].status': 'completed' }
      },
      { arrayFilters: [{ 't.orderId': order._id, 't.status': 'pending' }] }
    ));
  }

  // Affiliate
  if (order.affiliate) {
    updates.push(Wallet.findOneAndUpdate(
      { user: order.affiliate },
      {
        $inc: { balance: order.commissions.affiliate, pending: -order.commissions.affiliate },
        $set: { 'transactions.$[t].status': 'completed' }
      },
      { arrayFilters: [{ 't.orderId': order._id, 't.status': 'pending' }] }
    ));
  }

  await Promise.all(updates);
}

module.exports = { calculateCommissions, confirmEarnings };
