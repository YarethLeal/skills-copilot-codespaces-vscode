// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

// Get all comments for a post
const getComments = (req, res) => {
  const { id } = req.params;
  res.send(posts[id] || []);
};

// Add a comment to a post
const addComment = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const comments = posts[id] || [];
  const comment = { id: Math.random().toString(36).substr(2, 9), content };
  comments.push(comment);
  posts[id] = comments;
  // Send event to event bus
  axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { ...comment, postId: id },
  });
  res.status(201).send(comments);
};

// Handle events from event bus
app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);
  res.send({});
  const { type, data } = req.body;
  if (type === 'PostDeleted') {
    const { id } = data;
    delete posts[id];
  }
});

app.get('/posts/:id/comments', getComments);
app.post('/posts/:id/comments', addComment);

app.listen(4001, () => {
  console.log('Listening on 4001');
});