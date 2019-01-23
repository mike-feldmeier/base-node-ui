'use strict'

const displayIndex = (req, res) => res.render('index')

module.exports = router => {
  router.get('/', displayIndex);
};
