const Trade = require('./classes/Trade.js');
const { cancelOrders } = require('./orders.js');


function matchOrders(existingOrders, newOrder) {
    // console.log("aggressive order: " + JSON.stringify(newOrder));
    var symbol = newOrder.symbol;
    var eligibility = getOrdersEligibleForMatching(existingOrders, newOrder);
    var eligibleOrders = eligibility.eligibleOrders;
    var ineligibleOrders = eligibility.ineligibleOrders;
    var ordersToCancel = eligibility.ordersToCancel;

    cancelOrders(ordersToCancel);

    // now have eligible orders, so we can prioritize them
    // if incoming order is buy, prioritize lowest selling price; if sell, highest buying price
    // within the same price, prioritize earlier orders (FIFO)
    incomingIsBuy = newOrder.getDirection() === 1;
    var compareFunc = incomingIsBuy ? compareSellOrders : compareBuyOrders;
    eligibleOrders = eligibleOrders.sort(compareFunc);

    var remainingOrders = ineligibleOrders.concat(ordersToCancel);
    var trades = [];
    for (var passiveOrder of eligibleOrders) {
        if (!newOrder.isTradedOut()) {
            // console.log("passive order: " + JSON.stringify(passiveOrder));
            var amountAggressive = newOrder.getAmount();
            var amountPassive = passiveOrder.getAmount();
            var amountTraded = Math.min(amountPassive, amountAggressive);
            // console.log(`order ${newOrder.orderNumber} trading against passive order ${passiveOrder.orderNumber} for size ${amountTraded}`);
            var priceTraded = passiveOrder.price;  // passive order's price is used so incoming order gets best price
            var buyOrder = incomingIsBuy ? newOrder : passiveOrder;
            var sellOrder = incomingIsBuy ? passiveOrder : newOrder;
            var buyOrderNumber = buyOrder.orderNumber;
            var sellOrderNumber = sellOrder.orderNumber;
            var timeTraded = new Date().toISOString();
            var trade = new Trade(amountTraded, symbol, priceTraded, buyOrderNumber, sellOrderNumber, timeTraded);
            trades.push(trade);
            passiveOrder.tradeSize(amountTraded);
            newOrder.tradeSize(amountTraded);
            if (passiveOrder.isTradedOut()) {
                passiveOrder.markCompleted();
            }
            if (newOrder.isTradedOut()) {
                newOrder.markCompleted();
            }
        }
        remainingOrders.push(passiveOrder);  // do this no matter what, keep a record of the orders
    }

    // place the new order in the json no matter what so we have a record of it
    remainingOrders.push(newOrder);

    var matchingResult = {
        remainingOrders: remainingOrders,
        cancelledOrders: ordersToCancel,
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
    var ordersToCancel = [];  // auto-cancel any self-matching orders on the level
    incomingIsBuy = newOrder.getDirection() === 1;
    for (var order of existingOrders) {
        if (order.symbol !== newOrder.symbol) {
            throw new Error("shouldn't be matching orders with different symbols");
        }
        var priceIsEligible = incomingIsBuy ? (order.price <= newOrder.price) : (order.price >= newOrder.price);
        var sideIsEligible = incomingIsBuy ? (order.getDirection() === -1) : (order.getDirection() === 1);
        var statusIsEligible = order.status === "active";
        var isSameOwner = order.owner === newOrder.owner;
        var isSelfMatch = priceIsEligible && sideIsEligible && statusIsEligible && isSameOwner;
        var orderIsEligible = !isSelfMatch && priceIsEligible && sideIsEligible && statusIsEligible;
        if (isSelfMatch) {
            ordersToCancel.push(order);
        } else if (orderIsEligible) {
            eligibleOrders.push(order);
        } else {
            ineligibleOrders.push(order);
        }
    }
    return {
        eligibleOrders: eligibleOrders,
        ineligibleOrders: ineligibleOrders,
        ordersToCancel: ordersToCancel,
    }
}

module.exports = {
    matchOrders,
};
