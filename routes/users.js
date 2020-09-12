const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// const validator = require('validator');
const NotFoundError = require('../errors/not-found-err');
// const BadRequestError = require('../errors/bad-req-err');

const {
  getUsers, getSpecificUser, updateInfo, updateAvatar,
} = require('../controllers/users');

usersRouter.get('/', getUsers);
usersRouter.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().hex(),
  }),
}), getSpecificUser);

usersRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateInfo);

usersRouter.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required(),
  }),
}), updateAvatar);

usersRouter.all('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресур не найден'));
});

module.exports = usersRouter;
