const Trade = require('./classes/Trade.js');


function matchOrders(existingOrders, newOrder) {
    console.log("newOrder: " + JSON.stringify(newOrder));

    var symbol = newOrder.symbol;
    var eligibility = getOrdersEligibleForMatching(existingOrders, newOrder);
    var eligibleOrders = eligibility.eligibleOrders;
    var ineligibleOrders = eligibility.ineligibleOrders;
    console.log("eligibility: " + JSON.stringify(eligibility));

    // now have eligible orders, so we can prioritize them
    // if incoming order is buy, prioritize lowest selling price; if sell, highest buying price
    // within the same price, prioritize earlier orders (FIFO)
    incomingIsBuy = newOrder.getDirection() === 1;
    var compareFunc = incomingIsBuy ? compareSellOrders : compareBuyOrders;
    eligibleOrders = eligibleOrders.sort(compareFunc);

    var remainingOrders = ineligibleOrders.slice();  // copy the array
    var trades = [];
    var absSizeAggressive = newOrder.getAbsSize();
    for (var i = 0; i < eligibleOrders.length; i++) {
        var passiveOrder = eligibleOrders[i];
        var absSizePassive = passiveOrder.getAbsSize();
        var amountTraded = Math.min(absSizePassive, absSizeAggressive);
        var priceTraded = passiveOrder.price;  // passive order's price is used so incoming order gets best price
        var buyOrder = incomingIsBuy ? newOrder : passiveOrder;
        var sellOrder = incomingIsBuy ? passiveOrder : newOrder;
        var trade = new Trade(amountTraded, symbol, priceTraded, buyOrder, sellOrder);
        trades.push(trade);

        passiveOrder.tradeSize(amountTraded);
        newOrder.tradeSize(amountTraded);

        if (newOrder.isTradedOut()) {
            // no more matching to be done
            // check if the passive order still has size left
            var passiveSizeLeft = passiveOrder.getAbsSize();
            if (passiveSizeLeft > 0) {
                remainingOrders.push(passiveOrder);
            }
            // all remaining orders with size go in the remaining orders list
            for (var j = i+1; j < eligibleOrders.length; j++) {
                remainingOrders.push(eligibleOrders[j]);
            }
            break;
        }
    }

    // if any remains of this order, add it to the book
    if (!newOrder.isTradedOut()) {
        remainingOrders.push(newOrder);
    }

    var matchingResult = {
        remainingOrders: remainingOrders,
        trades: trades,
    }
    return matchingResult;
}

function compareBuyOrders(o1, o2) {
    // want higher prices first, so treat them as "less" so they'll appear earlier
    if (o1.price > o2.price) return -1;
    else if (o1.price < o2.price) return 1;
    // if price is tied, earlier order comes first in the sorted array
    else if (o1.timeReceived < o2.timeReceived) return -1;
    else if (o1.timeReceived > o2.timeReceived) return 1;
    return 0;
}

function compareSellOrders(o1, o2) {
    // want lower prices first, so treat them as "less" so they'll appear earlier
    if (o1.price < o2.price) return -1;
    else if (o1.price > o2.price) return 1;
    // if price is tied, earlier order comes first in the sorted array
    else if (o1.timeReceived < o2.timeReceived) return -1;
    else if (o1.timeReceived > o2.timeReceived) return 1;
    return 0;
}

function getOrdersEligibleForMatching(existingOrders, newOrder) {
    // if the incoming order is a buy, prices should be <= its price, if sell then >=
    var eligibleOrders = [];
    var ineligibleOrders = [];
    incomingIsBuy = newOrder.getDirection() === 1;
    for (var order of existingOrders) {
        if (order.symbol !== newOrder.symbol) {
            throw new Error("shouldn't be matching orders with different symbols");
        }
        var priceIsEligible = incomingIsBuy ? (order.price <= newOrder.price) : (order.price >= newOrder.price);
        var sideIsEligible = incomingIsBuy ? (order.getDirection() === -1) : (order.getDirection() === 1);
        var orderIsEligible = priceIsEligible && sideIsEligible;
        if (orderIsEligible) {
            console.log("adding eligible order: " + JSON.stringify(order));
            eligibleOrders.push(order);
        } else {
            ineligibleOrders.push(order);
        }
    }
    return {
        eligibleOrders: eligibleOrders,
        ineligibleOrders: ineligibleOrders,
    }
}

module.exports = {
    matchOrders,
};
