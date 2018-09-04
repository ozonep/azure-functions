const pgp = require('pg-promise')();

const cn = {
    host: process.env.PostgresDBHost,
    port: process.env.PostgresDBPOrt,
    database: process.env.PostgresDB,
    user: process.env.PostgresBDUser,
    password: process.env.PostgresDBPassword,
    ssl: false,
};
const db = pgp(cn);


module.exports = function (context, req) {
    if (req.query.exerciseId) {
        context.log(req.query.exerciseId);
        db.any('SELECT id, answer, normalized_answer, hash, user_id, exercise_id, date FROM answers LEFT JOIN student_answers ON answers.id = student_answers.answer_id WHERE exercise_id = $1', [req.query.exerciseId])
            .then(data => {
                context.res = {
                    status: 200,
                    body: JSON.stringify(data)
                };
                context.done();
            }).catch(err => {
                context.res = {
                    status: 400,
                    body: err.message
                };
                context.done();
            });
    }
    else {
        db.any('SELECT id, answer, normalized_answer, hash, user_id, exercise_id, date FROM answers LEFT JOIN student_answers ON answers.id = student_answers.answer_id')
            .then(data => {
                context.res = {
                    status: 200,
                    body: JSON.stringify(data)
                };
                context.done();
            })
            .catch(err => {
                context.res = {
                    status: 400,
                    body: err.message
                };
                context.done();
            });
    }
};