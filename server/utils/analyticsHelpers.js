// ─── utils/analyticsHelpers.js ────────────────────────────────────────────────
// M2 Owned — Reusable MongoDB aggregation pipeline builders for analytics

/**
 * Build a date range filter for MongoDB queries.
 * @param {string} [startDate] - ISO date string
 * @param {string} [endDate]   - ISO date string
 * @param {string} [period]    - 'week' | 'month' | 'quarter' | 'year' (relative)
 */
const buildDateRangeFilter = (startDate, endDate, period) => {
  if (startDate || endDate) {
    const filter = {};
    if (startDate) filter.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    if (endDate)   filter.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    return filter;
  }

  const now  = new Date();
  now.setHours(23, 59, 59, 999);
  
  const from = new Date();
  from.setHours(0, 0, 0, 0);

  switch (period) {
    case 'week':
      from.setDate(from.getDate() - 7);
      break;
    case 'month':
      from.setMonth(from.getMonth() - 1);
      break;
    case 'quarter':
      from.setMonth(from.getMonth() - 3);
      break;
    case 'year':
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      from.setMonth(from.getMonth() - 1); // default: last 30 days
  }

  return { $gte: from, $lte: now };
};

/**
 * Build aggregation pipeline to group revenue by time period.
 * @param {'day'|'week'|'month'} groupBy
 * @param {Object} dateFilter   - MongoDB date filter for createdAt
 */
const buildRevenuePipeline = (dateFilter, groupBy = 'month') => {
  const dateGroupExpr = {
    day: {
      $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' },
    },
    week: {
      $dateToString: {
        format: '%Y-W%V',
        date:   '$createdAt',
        timezone: 'Asia/Kolkata',
      },
    },
    month: {
      $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Kolkata' },
    },
  }[groupBy] || {
    $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Kolkata' },
  };

  return [
    // Stage 1: Filter by date range and only paid orders
    {
      $match: {
        createdAt:     { ...dateFilter },
        paymentStatus: 'paid',
      },
    },
    // Stage 2: Group by period
    {
      $group: {
        _id:           dateGroupExpr,
        revenue:       { $sum: '$finalAmount' },
        orderCount:    { $sum: 1 },
        avgOrderValue: { $avg: '$finalAmount' },
        totalDiscount: { $sum: '$discountAmount' },
      },
    },
    // Stage 3: Rename _id to period
    {
      $project: {
        _id:           0,
        period:        '$_id',
        revenue:       { $round: ['$revenue', 2] },
        orderCount:    1,
        avgOrderValue: { $round: ['$avgOrderValue', 2] },
        totalDiscount: { $round: ['$totalDiscount', 2] },
      },
    },
    // Stage 4: Sort chronologically
    { $sort: { period: 1 } },
  ];
};

/**
 * Build aggregation pipeline to find top-selling products.
 * @param {number} limit   - Number of top products to return (default 10)
 * @param {Object} [dateFilter] - Optional date filter for order items
 */
const buildTopProductsPipeline = (limit = 10, dateFilter = null) => {
  const matchStage = {
    $match: {
      paymentStatus: 'paid',
      ...(dateFilter ? { createdAt: { ...dateFilter } } : {}),
    },
  };

  return [
    matchStage,
    // Unwind items array to get one document per item
    { $unwind: '$items' },
    // Group by product name to aggregate sales of the same product regardless of re-seeding/different IDs
    {
      $group: {
        _id:         '$items.name',
        productId:   { $first: '$items.productId' },
        productName: { $first: '$items.name' },
        productImage:{ $first: '$items.image' },
        totalQtySold:{ $sum: '$items.qty' },
        totalRevenue:{ $sum: { $multiply: ['$items.price', '$items.qty'] } },
        orderCount:  { $sum: 1 },
      },
    },
    // Sort by qty sold descending
    { $sort: { totalQtySold: -1 } },
    { $limit: limit },
    // Lookup product details by name matching
    {
      $lookup: {
        from:         'products',
        localField:   'productName',
        foreignField: 'name',
        as:           'productDetails',
        pipeline:     [{ $project: { name: 1, images: { $slice: ['$images', 1] }, category: 1, price: 1 } }],
      },
    },
    {
      $project: {
        _id:          0,
        productId:    1,
        productName:  1,
        category:     { $arrayElemAt: ['$productDetails.category', 0] },
        image:        { $arrayElemAt: [{ $arrayElemAt: ['$productDetails.images', 0] }, 0] },
        totalQtySold: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        orderCount:   1,
      },
    },
  ];
};

const getKolkataDateString = (date) => {
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(date);
};

const getISOWeekAndYear = (date) => {
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const d = new Date(Date.UTC(tzDate.getFullYear(), tzDate.getMonth(), tzDate.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const getKolkataMonthString = (date) => {
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(date);
};

/**
 * Fills in periods that have 0 revenue so the charts render complete timelines
 */
const fillRevenueGaps = (revenueData, from, to, groupBy) => {
  const map = new Map();
  revenueData.forEach((item) => {
    map.set(item.period, item);
  });

  const filled = [];
  const current = new Date(from);
  const targetTo = new Date(to);

  if (groupBy === 'day') {
    while (current <= targetTo || getKolkataDateString(current) === getKolkataDateString(targetTo)) {
      const periodStr = getKolkataDateString(current);
      if (!map.has(periodStr)) {
        filled.push({
          period: periodStr,
          revenue: 0,
          orderCount: 0,
          avgOrderValue: 0,
          totalDiscount: 0,
        });
      } else {
        filled.push(map.get(periodStr));
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (groupBy === 'week') {
    while (current <= targetTo || getISOWeekAndYear(current) === getISOWeekAndYear(targetTo)) {
      const periodStr = getISOWeekAndYear(current);
      if (filled.length === 0 || filled[filled.length - 1].period !== periodStr) {
        if (!map.has(periodStr)) {
          filled.push({
            period: periodStr,
            revenue: 0,
            orderCount: 0,
            avgOrderValue: 0,
            totalDiscount: 0,
          });
        } else {
          filled.push(map.get(periodStr));
        }
      }
      current.setDate(current.getDate() + 7);
    }
    const toWeekStr = getISOWeekAndYear(targetTo);
    if (filled.length > 0 && filled[filled.length - 1].period !== toWeekStr) {
      if (map.has(toWeekStr)) {
        filled.push(map.get(toWeekStr));
      } else {
        filled.push({
          period: toWeekStr,
          revenue: 0,
          orderCount: 0,
          avgOrderValue: 0,
          totalDiscount: 0,
        });
      }
    }
  } else if (groupBy === 'month') {
    while (current <= targetTo || getKolkataMonthString(current) === getKolkataMonthString(targetTo)) {
      const periodStr = getKolkataMonthString(current);
      if (filled.length === 0 || filled[filled.length - 1].period !== periodStr) {
        if (!map.has(periodStr)) {
          filled.push({
            period: periodStr,
            revenue: 0,
            orderCount: 0,
            avgOrderValue: 0,
            totalDiscount: 0,
          });
        } else {
          filled.push(map.get(periodStr));
        }
      }
      current.setMonth(current.getMonth() + 1);
    }
    const toMonthStr = getKolkataMonthString(targetTo);
    if (filled.length > 0 && filled[filled.length - 1].period !== toMonthStr) {
      if (map.has(toMonthStr)) {
        filled.push(map.get(toMonthStr));
      } else {
        filled.push({
          period: toMonthStr,
          revenue: 0,
          orderCount: 0,
          avgOrderValue: 0,
          totalDiscount: 0,
        });
      }
    }
  }

  // Deduplicate
  const uniqueFilled = [];
  const seen = new Set();
  for (const item of filled) {
    if (!seen.has(item.period)) {
      seen.add(item.period);
      uniqueFilled.push(item);
    }
  }

  return uniqueFilled;
};

/**
 * Format currency to INR string
 */
const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

/**
 * Calculate percentage change between two values
 */
const percentChange = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

module.exports = {
  buildDateRangeFilter,
  buildRevenuePipeline,
  buildTopProductsPipeline,
  formatINR,
  percentChange,
  fillRevenueGaps,
};

