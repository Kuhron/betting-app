const express = require('express');
const fs = require('fs');

const filepaths = require('./filepaths.js')

const Order = require('./classes/Order.js');
const OrderBookLevel = require('./classes/OrderBookLevel.js');


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
            var symbol = orderParams.symbol;
            var price = parseInt(orderParams.price);
            var order = new Order(size, symbol, price);
            orders.push(order);
        }
    }
    return orders;
}

function writeOrders(orders, symbol) {
    var fp = filepaths.getOrdersFilepathForSecurity(symbol);
    for (var order of orders) {
        if (order.symbol !== symbol) {
            throw new Error("got order with wrong symbol");
        }
    }
    var d = {orders: orders};
    fs.writeFileSync(fp, JSON.stringify(d));
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
        var absSize = Math.abs(order.size);
        if (direction === 1) {
            level.bids += absSize;
        } else {
            level.offers += absSize;
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

module.exports = {
    getOrdersFromSymbol,
    getOrderBookLevelsFromOrders,
    getTopLevels,
    writeOrders,
};


if (require.main === module) {
    var orders = getOrdersFromSymbol("XYZ");
    console.log("orders: " + JSON.stringify(orders));
    var levels = getOrderBookLevelsFromOrders(orders);
    console.log("levels: " + JSON.stringify(levels));
}
