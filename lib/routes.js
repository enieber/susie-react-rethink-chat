const Joi = require('joi');
const Path = require('path');
const Thinky = require('thinky')();
const Type = Thinky.type;

// create the model for messages
const Message = Thinky.createModel('Message', {
    username: Type.string(),
    message: Type.string()
});

module.exports = [
    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            reply.file(Path.join(__dirname, '../public/index.html'));
        }
    },
    {
        method: 'GET',
        path: '/{p*}',
        handler: {
            directory: {
                path: Path.join(__dirname, '../public')
            }
        }
    },
    {
        method: 'GET',
        path: '/chat-feed',
        handler: function (request, reply) {

            Message
                .changes()
                .run()
                .then((feed) => {
                    feed.each((err, doc) => {
                        reply.event({ data: doc });
                    });
                });
        }
    },
    {
        config: {
            validate: {
                payload: {
                    message: Joi.string(),
                    username: Joi.string()
                }
            }
        },
        method: 'POST',
        path: '/new-message',
        handler: function (request, reply) {

            const msg = new Message(request.payload);
            msg
                .save()
                .then(() => {

                    reply();
                });


        }
    }
];
