const express = require('express');
const fs = require('fs');

const filepaths = require('./filepaths.js')
const { getAllSecurities } = require('./securities.js');

const Order = require('./classes/Order.js');
const OrderBookLevel = require('./classes/OrderBookLevel.js');


function getAllOrders() {
    var secs = getAllSecurities();
    var orders = [];
    for (var sec of secs) {
        var ordersThisSec = getOrdersFromSymbol(sec.symbol);
        orders = orders.concat(ordersThisSec);
    }
    return orders;
}

function getOrdersFromSymbol(symbol) {
    // if symbol is null, get all orders
    const fp = filepaths.getOrdersFilepathForSecurity(symbol);
    var s = fs.readFileSync(fp);
    var orderParamsList = JSON.parse(s)["orders"];
    var orders = [];
    for (var i = 0; i < orderParamsList.length; i++) {
        var orderParams = orderParamsList[i];
        if ((symbol === null) || (orderParams.symbol === symbol)) {
            var size = parseInt(orderParams.size);
            var originalSize = parseInt(orderParams.originalSize);
            var symbol = orderParams.symbol;
            var price = parseFloat(orderParams.price);
            var owner = orderParams.owner;
            var orderNumber = parseInt(orderParams.orderNumber);
            var timeReceived = orderParams.timeReceived;  // ISO 8601 string
            var status = orderParams.status;
            var order = new Order(size, originalSize, symbol, price, owner, orderNumber, timeReceived, status);
            orders.push(order);
        }
    }
    return orders;
}

function getOrdersByNumberFromSymbol(symbol) {
    var orders = getOrdersFromSymbol(symbol);
    var result = {};
    for (var order of orders) {
        result[order.orderNumber] = order;
    }
    return result;
}

function getActiveOrdersFromSymbol(symbol) {
    var orders = getOrdersFromSymbol(symbol);
    var res = [];
    for (var order of orders) {
        if (order.status === "active") {
            res.push(order);
        }
    }
    return res;
}

function writeOrders(orders, symbol) {
    var fp = filepaths.getOrdersFilepathForSecurity(symbol);
    for (var order of orders) {
        if (order.symbol !== symbol) {
            throw new Error("got order with wrong symbol");
        }
    }
    var d = {orders: orders};
    fs.writeFileSync(fp, JSON.stringify(d, null, 4));
}

function getOrderBookLevelsFromOrders(orders) {
    // given a list of orders, create the levels that aggregate the information
    var levelsByPrice = {};  // object will cast int keys to str
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var level;
        if (order.price in levelsByPrice) {
            level = levelsByPrice[order.price];
        } else {
            level = new OrderBookLevel(order.price, 0, 0);
        }
        var direction = order.getDirection();
        var amount = order.getAmount();
        if (direction === 1) {
            level.bids += amount;
        } else {
            level.offers += amount;
        }
        levelsByPrice[order.price] = level;
    }
    
    var levels = [];
    for (var price in levelsByPrice) {
        var level = levelsByPrice[price];
        levels.push(level);
    }
    levels = levels.sort(compareLevelsByPrice);
    return levels;
}

function compareLevelsByPrice(l1, l2) {
    if (l1.price < l2.price) return -1;
    if (l1.price > l2.price) return 1;
    return 0;
}

function getTopLevels(levels, n) {
    // return them in reverse order so the higher prices are at the top of the table
    // up to n on each side
    var bidLevels = [];
    var askLevels = [];
    for (var level of levels) {
        var hasBids = level.bids > 0;
        var hasOffers = level.offers > 0;
        if (hasBids && hasOffers) {
            throw new Error("level has both bids and offers");
        }
        if (hasBids) {
            bidLevels.push(level);
            bidLevels = bidLevels.sort(compareLevelsByPrice);
            while (bidLevels.length > n) {
                // remove the lowest bid
                bidLevels = bidLevels.slice(1, bidLevels.length);
            }
        } else if (hasOffers) {
            askLevels.push(level);
            askLevels = askLevels.sort(compareLevelsByPrice);
            while (askLevels.length > n) {
                // remove the highest ask
                askLevels = askLevels.slice(0, askLevels.length - 1);
            }
        } else {
            // empty level, ignore it I guess? 
            // maybe should be deleted from the book, 
            // or it's okay to leave them in there 
            // as long as there aren't way too many of them 
            // slowing down the order book processing
        }
    }
    bidLevels.reverse();
    askLevels.reverse();
    var levels = askLevels.concat(bidLevels);
    return levels;
}

function getNextOrderNumber() {
    var orders = getAllOrders();
    return orders.length + 1;
}

function lookupOrder(symbol, orderNumber) {
    var orders = getOrdersFromSymbol(symbol);
    var matchingOrders = [];
    for (var order of orders) {
        if (order.orderNumber === orderNumber) {
            matchingOrders.push(order);
        }
    }
    if (matchingOrders.length === 0) {
        return null;
    } else if (matchingOrders.length === 1) {
        return matchingOrders[0];
    } else {
        throw new Error(`more than one order found with orderNumber ${orderNumber}`);
    }
}

function cancelOrders(orders) {
    for (var order of orders) {
        cancelOrder(order);
    }
}

function cancelOrder(order) {
    order.cancel();
    updateOrderRecord(order);
}

function updateOrderRecord(order) {
    var orders = getOrdersByNumberFromSymbol(order.symbol);
    orders[order.orderNumber] = order;
    orders = Object.values(orders);
    writeOrders(orders, order.symbol);
}


module.exports = {
    getOrdersFromSymbol,
    getActiveOrdersFromSymbol,
    getOrderBookLevelsFromOrders,
    getOrdersByNumberFromSymbol,
    getTopLevels,
    writeOrders,
    getNextOrderNumber,
    lookupOrder,
    cancelOrder,
    cancelOrders,
};


if (require.main === module) {
    var orders = getOrdersFromSymbol("XYZ");
    console.log("orders: " + JSON.stringify(orders));
    var levels = getOrderBookLevelsFromOrders(orders);
    console.log("levels: " + JSON.stringify(levels));
}
