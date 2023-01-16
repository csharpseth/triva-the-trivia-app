const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
    },
    prompts: [mongoose.SchemaTypes.ObjectId],
})

module.exports.TopicSchema = TopicSchema
module.exports.TopicModel = mongoose.model("Topic", TopicSchema)