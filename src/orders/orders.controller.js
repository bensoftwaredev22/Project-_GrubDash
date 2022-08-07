const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders })
}

function create(req, res, next) {
  const {data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,    
  }
  orders.push(newOrder);
  res.status(201).json({ data: newOrder })
};

function read(req, res, next) {
  res.json({ data: res.locals.order })
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId)
  console.log(foundOrder)
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found ${orderId}`
  });
};

function update(req, res, next) {
  const orders = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
  orders.deliverTo = deliverTo
  orders.mobileNumber = mobileNumber
  orders.status = status
  orders.dishes = dishes
  
  res.json({data: orders})
}

function hasDeliverToProperty(req, res, next) {
  const { data: {deliverTo } = {} } = req.body
  
  if (deliverTo && deliverTo.length > 0) {
    return next()
  }
   next({
     status: 400,
     message: "Order must include a deliverTo"
   })
}

function hasMobileNumberProperty(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body
  
  if (mobileNumber && mobileNumber.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber"
  })
}

function hasDishesProperty(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  
  if (dishes && dishes.length > 0 && Array.isArray(dishes)) {
    return next()
  } else if (!dishes || dishes.length == 0 || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: "oreder must include at least one dish"
    })
  }  
};

function hasStatusProperty(req, res, next) {
  const { data: { status } = {} } = req.body
  
  if (status && status !== "delivered" && status !== "invalid" && status.length > 0) {
    return next()
  }
  next({
    status: 400,
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
  })
}

function hasDishQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body
  
  for(let i=0; i < dishes.length; i++) {
    if (!validQuantity(dishes[i].quantity)) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`
      })
    }
  }
  next()
};
function validQuantity(quantity) {
  return (quantity && quantity > 0 && Number.isInteger(quantity))
};

function idMatches(req, res, next) {
  const { orderId } = req.params
  const { data: {id} = {} } = req.body;
  if (id && id !== orderId) {
  next({ status: 400, message: `Order id dones not match route id. Order: ${id}, Route ${orderId}`}); 
  }
  next() 
};

function statusValidForDelete(req, res, next) {
  let order = res.locals.order
  
  if (order.status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending"
    });
  }
  next()
};

function destroy(req, res, next) {
  const { orderId } = req.params;
  //console.log(orderId)
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
};

module.exports = {
  list,
  create: [
    hasDeliverToProperty,
    hasMobileNumberProperty,
    hasDishesProperty,
    hasDishQuantity,
    create
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    idMatches,
    hasDeliverToProperty,
    hasDishesProperty,
    hasMobileNumberProperty,
    hasStatusProperty,
    hasDishQuantity,
    idMatches,
    update
  ],
  delete: [orderExists, statusValidForDelete, destroy],
}
