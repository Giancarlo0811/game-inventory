const Category = require('../models/category');
const Game = require('../models/game');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');

// Display list of all categories
exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({name: 1}).exec();

    res.render('category_list', {
        title: 'Lista de Categorías',
        category_list: allCategories,
    });
});

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, gamesInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Game.find({category: req.params.id}, 'name description').exec(),
    ]);

    if(category === null) {
        const err = new Error("Categoría no encontrada");
        err.status = 404;
        return next(err);
    }

    res.render('category_detail', { 
        category: category,
        category_games: gamesInCategory,
    });
});

// Display category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render('category_form', {title: 'Crear Categoría'});
});

// Handle Category create on POST.
exports.category_create_post = [
    // Validate and sanitize the name field
    body('name', 'La Categoría debe contener al menos 3 caracteres')
    .trim()
    .isLength({min: 3})
    .escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({name: req.body.name});

        if (!errors.isEmpty()) {
            res.render('category_form', {
                title: 'Crear Categoría',
                category: category,
                errors: errors.array(),
            });
        }
        else {
            // Check if Genre with same name already exists.
            const categoryExists = await Category.findOne({name: req.body.name})
            .collation({locale: 'en', strength: 2})
            .exec();

            if (categoryExists) {
                res.redirect(categoryExists.url);
            } else {
                await category.save();
                res.redirect(category.url);
            }
        }
    }),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
    const [category, allGamesbyCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Game.find({category: req.params.id}, 'name description').exec(),
    ]);

    if(category === null) {
        res.redirect("/catalog/categories");
    }

    res.render('category_delete', {
        title: 'Eliminar Categoría',
        category: category,
        category_games: allGamesbyCategory,
    });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const [category, allGamesbyCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Game.find({category: req.params.id}, 'name description').exec(),
    ]);

    if (allGamesbyCategory.length > 0) {
        res.render('category_delete', {
            title: 'Eliminar Categoría',
            category: category,
            category_games: allGamesbyCategory,
        });
        return;
    }
    else {
        await Category.findByIdAndDelete(req.body.categoryid);
        res.redirect('/catalog/categories');
    }
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();

    if (category === null) {
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
    }

    res.render('category_form', {
        title: 'Actualizar Categoría',
        category: category,
    });
});

// Handle Category update on POST.
exports.category_update_post = [
    body('name', 'La Categoría debe contener al menos 3 caracteres')
    .trim()
    .isLength({min: 3})
    .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            _id: req.params.id
        });

        if(!errors.isEmpty) {
            res.render('category_form', {
              title: 'Actualizar Categoría',
              category: category,
              errors: errors.array(),
            });
            return;
          }
          else {
            await Category.findByIdAndUpdate(req.params.id, category);
            res.redirect(category.url);
          }
    }),
];