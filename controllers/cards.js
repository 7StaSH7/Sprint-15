const Card = require('../models/card');
const ServerError = require('../errors/server-err');
const NotFoundError = require('../errors/not-found-err');
const NotEnoughRightsError = require('../errors/not-enough-rights-err');
const BadRequestError = require('../errors/bad-req-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .orFail(new NotFoundError('В базе данных пока нет карточек'))
    .then((cards) => res.send({ data: cards }))
    .catch(() => next(new ServerError('Произошла ошибка при получении карточек')));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => next(new ServerError(`Произошла ошибка при создании карточки - ${err.message}`)));
};

module.exports.deleteCard = (req, res, next) => {
  const { id } = req.params;
  Card.findById(req.params.id)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) throw new NotFoundError(`Карточка с таким id: ${id} не найдена`);
      if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) throw new NotEnoughRightsError('Недостаточно прав');
      Card.findByIdAndRemove(id)
        .then(() => res.send({ data: card }));
    })
    .catch(() => next(new ServerError('Произошла ошибка при получении карточек')));
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).orFail(new NotFoundError(`Карточка с id: ${req.params.id} не найдена`))
    .then((card) => res.send({ data: card }))
    .catch(() => next(new BadRequestError('Не удалось поставить лайк')));
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).orFail(new NotFoundError(`Карточка с id: ${req.params.id} не найдена`))
    .then((card) => res.send({ data: card }))
    .catch(() => next(new BadRequestError('Не удалось убрать лайк')));
};
