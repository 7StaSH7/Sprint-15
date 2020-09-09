const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');
const AuthError = require('../errors/auth-err');
const ConflictError = require('../errors/conflict-err');
const BadRequestError = require('../errors/bad-req-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(new ServerError(`Произошла ошибка при получении пользователей - ${err.message}`)));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.send({
          _id: user._id,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
        }))
        .catch((err) => {
          if (err.name === 'MongoError') throw new ConflictError('Пользователь с такими данными уже существует');
          throw new BadRequestError(`Произошла ошибка при создании пользователя - ${err.message}`);
        });
    })
    .catch(() => next(new ServerError('Забыли заполнить пароль!')));
};

module.exports.getSpecificUser = (req, res, next) => {
  User.findByIdAndRemove(req.params.id)
    .orFail(new NotFoundError(`Пользователь с таким id: ${req.params.id} не найден!`))
    .then((user) => res.send({ data: user }))
    .catch((err) => next(new ServerError(`Произошла ошибка при удалении карточки - ${err.message}`)));
};

module.exports.updateInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about })
    .orFail(new NotFoundError(`Пользователь с таким id: ${req.params.id} не найден!`))
    .then((user) => res.send({ data: user }))
    .catch((err) => next(new ServerError(`Произошла ошибка при удалении карточки - ${err.message}`)));
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar })
    .orFail(new NotFoundError(`Пользователь с таким id: ${req.params.id} не найден!`))
    .then((user) => res.send({ data: user }))
    .catch((err) => next(new ServerError(`Произошла ошибка при удалении карточки - ${err.message}`)));
};

module.exports.login = (req, res, next) => {
  const {
    email, password,
  } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secretphrase', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      });
      res.send({ token });
    })
    .catch(() => next(new AuthError('Ошибка авторизации')));
};
