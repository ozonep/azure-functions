const Joi = require('joi');
const decomment = require('decomment');
const cuid = require('cuid');
const pgp = require('pg-promise')();
const sum = require('hash-sum');

const cn = {
    host: process.env.PostgresDBHost, 
    port: process.env.PostgresDBPort, 
    database: process.env.PostgresDB,
    user: process.env.PostgresBDUser,
    password: process.env.PostgresDBPassword,
    ssl: true,
};
const db = pgp(cn);

const validateAnswer = (answer) => {
    const schema = {
        answer: Joi.string().min(5).required(),
        userId: Joi.string().required(),
        exerciseId: Joi.string().required(),
    };
    return Joi.validate(answer, schema);
};

module.exports = function (context, req) {
    if (req.body)  {
        const uniqueId = cuid();
        const { error } = validateAnswer(req.body);
        if (error) {
            context.res = {
                status: 400,
                body: error.details[0].message
            };
            context.done();
        }
        const noCommentsAnswer = decomment(req.body.answer);
        const normalizedAnswer = noCommentsAnswer.replace(/\s+/g, ' ').trim();
        const hashedAnswer = sum(normalizedAnswer);
        db.tx(t => t.batch([
            t.none('INSERT INTO student_answers (answer_id, user_id, answer) VALUES ($1, $2, $3)', [uniqueId, req.body.userId, req.body.answer]),
            t.none('INSERT INTO answers (id, normalized_answer, hash, exercise_id) VALUES ($1, $2, $3, $4)', [uniqueId, normalizedAnswer, hashedAnswer, req.body.exerciseId]),
        ]))
            .then(() => {
                context.res = {
                    status: 200,
                    body: uniqueId
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
    } else {
        context.res = {
            status: 400,
            body: "No body im request"
        };
        context.done();
    }
};