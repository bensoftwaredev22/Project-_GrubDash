const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: dishes});
}

function create(req, res, next) {
  const {data: { name, description, price, image_url } = {} } = req.body
  const newId = nextId();
  const newDish = {
    id: newId,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish)
  res.status(201).json({ data: newDish });
};

function hasNameProperty(req, res, next) {
  const { data: { name } = {} } = req.body
  
  if (name && name.length > 0) {
    return next();
  }
  next({ status: 400, message: "Dish must include a name"})
};

function hasDescriptionProperty(req, res, next) {
  const { data: { description } = {} } = req.body;
  
  if (description && description.length > 0) {
    return next()
  } 
  next({ status: 400, message: "Dish must include a description"});
};

function hasPriceProperty(req, res, next) {
  const { data: { price } = {} } = req.body
  
  if (price <= 0 || !Number.isInteger(price)) {
    return next({ status: 400, message: "Dish must have a price that is an integer greater than 0"})
  }
  next();
};

function hasImageProperty(req, res, next) {
  const { data: { image_url } = {} } = req.body
  
  if (image_url && image_url.length > 0) {
    return next();
  }
  next({ status: 400, message: "Dish must include a image_url"})
};

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found ${dishId}`
  })
}

function idMatches(req, res, next) {
  const { dishId } = req.params
  const { data: {id} = {} } = req.body;
  if (id && id !== dishId) {
     return next({ status: 400, message: `Order id dones not match route id. Order: ${id}, Route ${dishId}`});
  }
  next()
};

function read(req, res, next) {
  res.json({ data: res.locals.dish })
}

function update(req, res, next) {
  const dish = res.locals.dish 
  const {data: { name, description, price, image_url } = {} } = req.body
  dish.name = name
  dish.description = description
  dish.price = price
  dish.image_url = image_url
  
  res.json({data: dish})
}


module.exports = {
  list,
  create: [
    hasNameProperty,
    hasDescriptionProperty,
    hasPriceProperty,
    hasImageProperty,
    create
  ],
  read: [dishExists, read],
  update: [
    dishExists, 
    hasNameProperty, 
    hasDescriptionProperty, 
    hasPriceProperty, 
    hasImageProperty, 
    idMatches, 
    update
  ],
}