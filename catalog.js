function isValidLoan(daysLate) {
  return daysLate >= 0;
}

function calculateLateFee(daysLate, ratePerDay) {
  if (daysLate <= 1) {
    return 0;
  }
  const fee = Math.round(daysLate * ratePerDay);
  return Math.min(Math.max(fee, 1), 20);
}

module.exports = { isValidLoan, calculateLateFee };
