'use strict';

module.exports = {
up: (queryInterface, Sequelize) => {
return Promise.all([
queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0"), 
queryInterface.sequelize.query('ALTER TABLE call_outcomes_transitions DROP FOREIGN KEY `call_outcomes_transitions_ibfk_1`'),
queryInterface.sequelize.query('ALTER TABLE call_outcomes_transitions DROP FOREIGN KEY `call_outcomes_transitions_ibfk_2`'),
queryInterface.sequelize.query('ALTER TABLE call_outcomes_transitions DROP INDEX task_id'),
queryInterface.sequelize.query('ALTER TABLE call_outcomes_transitions DROP INDEX user_id'),
queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1")
]);
},
down: (queryInterface, Sequelize) => {
return queryInterface.sequelize
.query("SET FOREIGN_KEY_CHECKS = 0")
.then(() => {
return queryInterface.sequelize.query("alter table call_outcomes_transitions ADD FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE");
})
.then(() => {
return queryInterface.sequelize.query("alter table call_outcomes_transitions ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
})
.then(() => {
return queryInterface.rem('SET FOREIGN_KEY_CHECKS = 1')
});
}
};