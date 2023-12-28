#! /usr/bin/env node

console.log(
  'This script populates some test games and categories'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Game = require('./models/game');
const Category = require('./models/category');

const games = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategory();
  await createGame();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name) {
  const category = new Category({ name: name });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function gameCreate(index, name, description, price, number_of_items, category) {
  const gameDetail = {
    name: name,
    description: description,
    price: price,
    number_of_items: number_of_items,
  };
  if (category != false) gameDetail.category = category;

  const game = new Game(gameDetail);
  await game.save();
  games[index] = game;
  console.log(`Added game: ${name}`);
}

async function createCategory() {
  console.log('Adding categories');
  await Promise.all([
    categoryCreate(0,'RPG'),
    categoryCreate(1, 'Shooter'),
    categoryCreate(2, 'Sports'),
    categoryCreate(3, 'Open World'),
  ]);
}

async function createGame() {
  console.log('Adding games');
  await Promise.all([
    gameCreate(0,
      'The Witcher 3',
      'Caza diversos monstruos sedientos de sangre, desde bestias salvajes que merodean por los pasos de montaña hasta astutos depredadores sobrenaturales que acechan en las sombras de las bulliciosas calles de las ciudades.',
      20.50,
      4,
      [categories[0], categories[3]]
    ),
    gameCreate(1,
      'Fallout 3',
      'Juego de rol de acción ambientado en el páramo árido de una sociedad post-apocalíptica.',
      10.99,
      2,
      [categories[0], categories[3]]
    ),
    gameCreate(2,
      'Red Dead Redemption II',
      'Después de que un robo sale mal en la ciudad occidental de Blackwater, Arthur Morgan y la banda Van der Linde se ven obligados a huir. Con agentes federales y los mejores cazarrecompensas de la nación pisándoles los talones, la pandilla debe robar y abrirse camino a través del accidentado corazón de Estados Unidos para sobrevivir.',
      30.99,
      10,
      [categories[3]]
    ),
    gameCreate(3,
      'FIFA 23',
      'Simulación de fútbol.',
      25.00,
      5,
      [categories[2]]
    ),
    gameCreate(4,
      'Juego de prueba 1',
      'Descripcion del juego de prueba 1',
      1.00,
      1,
      [categories[0]]
    ),
    gameCreate(5,
      'Juego de prueba 2',
      'Descripcion del juego de prueba 1',
      1.05,
      1,
      false
    ),
    gameCreate(6,
      'Call of Duty Black Ops',
      'Shooter en primera persona. El jugador asume el papel de un soldado de infantería que puede empuñar varias armas de fuego (de las cuales sólo se pueden llevar dos a la vez), lanzar granadas y otros explosivos y utilizar otros equipos como armas.',
      9.99,
      3,
      categories[1]
    ),
  ])
}