const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const regexUrl = require('regex-url');
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

cardsRouter.get('/', getCards);
cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(regexUrl, 'custom url validation'),
  }),
}), createCard);

cardsRouter.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().hex(),
  }),
}), deleteCard);

cardsRouter.put('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().hex(),
  }),
}), likeCard);

cardsRouter.delete('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().hex(),
  }),
}), dislikeCard);

module.exports = cardsRouter;
