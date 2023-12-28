const Game = require('../models/game');
const Category = require('../models/category');
const { body, validationResult } = require("express-validator");

const asyncHandler = require('express-async-handler');

// home page
exports.index = asyncHandler(async (req, res, next) => {
    const [numGames, numCategories] = await Promise.all([
        Game.countDocuments({}).exec(),
        Category.countDocuments({}).exec(),
    ]);

    res.render('index', {
        title: 'Inventario de Videojuegos',
        game_count: numGames,
        category_count: numCategories,
    });
});

// Display list of all games.
exports.game_list = asyncHandler(async (req, res, next) => {
    const allGames = await Game.find({}, 'name')
    .sort({name: 1})
    .exec();

    res.render('game_list', {title: 'Lista de Juegos', game_list: allGames});
});

// Display detail page for a specific game.
exports.game_detail = asyncHandler(async (req, res, next) => {
    const game = await Game.findById(req.params.id).populate('category').exec();

    if (game === null) {
        const err = new Error("Juego no encontrado");
        err.status = 404;
        return next(err);
    }

    res.render('game_detail', {
        title: game.name,
        game: game,
    });
});

// Display game create form on GET.
exports.game_create_get = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({name: 1}).exec();

    res.render('game_form', {
        title: 'Agregar Juego',
        categories: allCategories
    });
});

// Handle game create on POST.
exports.game_create_post = [
    // Convert category to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category = 
                typeof req.body.category === 'undefined' ? [] : [req.body.category];
        }
        next();
    },

    // Validate and sanitize fields.
    body("name", "El nombre no debe estar vacío")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('description', 'La descripción no debe estar vacía')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('price', 'El precio no debe estar vacío')
    .optional({ values: "falsy" })
    .toFloat()
    .escape(),
    body('quantity', 'La cantidad no debe estar vacía')
    .optional({ values: "falsy" })
    .isInt({min: 1})
    .toInt()
    .escape(),
    body('category.*').escape(),

    //process request
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const game = new Game({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            number_of_items: req.body.quantity,
            category: req.body.category
        });

        if (!errors.isEmpty()) {
            const allCategories = await Category.find().sort({name: 1}).exec();

            for (const category of allCategories) {
                if (game.category.includes(category._id)) {
                    category.checked = 'true';
                }
            }

            res.render('game_form', {
                title: 'Agregar Juego',
                categories: allCategories,
                game: game,
                errors: errors.array(),
            });
        }
        else {
            await game.save();
            res.redirect(game.url);
        }
    }),
];

// Display game delete form on GET.
exports.game_delete_get = asyncHandler(async (req, res, next) => {
    const game = await Game.findById(req.params.id).populate('category').exec();

    if (game === null) {
        res.redirect('/catalog/games');
    }

    res.render('game_delete', {
        title: 'Eliminar Juego',
        game: game,
    })
});

// Handle game delete on POST.
exports.game_delete_post = asyncHandler(async (req, res, next) => {
    await Game.findByIdAndDelete(req.body.gameid);
    res.redirect('/catalog/games');
});

// Display game update form on GET.
exports.game_update_get = asyncHandler(async (req, res, next) => {
    const [game, allCategories] = await Promise.all([
        Game.findById(req.params.id).exec(),
        Category.find().sort({name: 1}).exec(),
    ]);

    if (game === null) {
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
    }

    allCategories.forEach(category => {
        if (game.category.includes(category._id)) {
            category.checked = 'true';
        }
    });

    res.render('game_form', {
        title: 'Actualizar Juego',
        categories: allCategories,
        game: game,
    });
});

// Handle game update on POST.
exports.game_update_post = [
    // Convert the category to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category =
              typeof req.body.category === "undefined" ? [] : [req.body.category];
        }
        next();
    },

    // Validate and sanitize fields.
    body("name", "El nombre no debe estar vacío")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('description', 'La descripción no debe estar vacía')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('price', 'El precio no debe estar vacío')
    .optional({ values: "falsy" })
    .toFloat()
    .escape(),
    body('quantity', 'La cantidad no debe estar vacía')
    .optional({ values: "falsy" })
    .isInt({min: 1})
    .toInt()
    .escape(),
    body('category.*').escape(),

    // Process request
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const game = new Game({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            number_of_items: req.body.quantity,
            category: typeof req.body.category === 'undefined' ? [] : req.body.category,
            _id: req.params.id // keep old id.
        });

        if (!errors.isEmpty()) {
            const allCategories = await Category.find().sort({name: 1}).exec();

            // Mark our selected categories as checked.
            for (const category of allCategories) {
                if (game.category.indexOf(category._id) > -1) {
                    category.checked = 'true';
                }
            }

            res.render('game_form', {
                title: 'Actualizar Juego',
                categories: allCategories,
                game: game,
                errors: errors.array(),
            });
            return;
        }
        else {
            const updatedGame = await Game.findByIdAndUpdate(req.params.id, game, {});
            res.redirect(updatedGame.url);
        }
    }),
];