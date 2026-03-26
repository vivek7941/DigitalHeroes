
const calculateDrawResults = (winningNumber, allScores, activeSubscriberCount) => {
  
  const subscriptionFee = 10;
  const totalPrizePool = activeSubscriberCount * subscriptionFee * 0.5; 

  
  const winners = allScores.filter(score => score.value === winningNumber);


  const distribution = {
    jackpot: (totalPrizePool * 0.40).toFixed(2),
    tier4: (totalPrizePool * 0.35).toFixed(2),
    tier3: (totalPrizePool * 0.25).toFixed(2)
  };

 
  const prizePerWinner = winners.length > 0 
    ? (totalPrizePool / winners.length).toFixed(2) 
    : 0;

  return {
    winningNumber,
    totalPrizePool: totalPrizePool.toFixed(2),
    winnersCount: winners.length,
    winnersList: winners.map(w => ({
      userId: w.userId,
      matchedValue: w.value,
      prizeAmount: prizePerWinner
    })),
    tierBreakdown: distribution,
    
    rolloverTriggered: winners.length === 0
  };
};



const generateWinningNumber = (mode = 'random', allScores = []) => {
  if (mode === 'weighted' && allScores.length > 0) {
    
    const counts = {};
    allScores.forEach(s => counts[s.value] = (counts[s.value] || 0) + 1);
    return parseInt(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
  }

  
  return Math.floor(Math.random() * 45) + 1;
};

module.exports = { calculateDrawResults, generateWinningNumber };