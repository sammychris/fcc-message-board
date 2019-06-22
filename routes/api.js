/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const expect = require('chai').expect;

const BoardSchema = new mongoose.Schema({
	text : { type: String, required: true },
	created_on: { type: Date, default: Date.now },
	bumped_on: { type: Date, default: Date.now },
	reported: { type: Boolean, default: false },
	delete_password: { type: String, required: true },
	replies: [],
	replycount: { type: Number, default: 0 }
})

const ReplySchema = new mongoose.Schema({
	text : { type: String, required: true },
	created_on: { type: Date, default: Date.now },
	reported: { type: Boolean, default: false },
	delete_password: { type: String, required: true }
})

const Board = (boardName) => mongoose.model(boardName, BoardSchema); 
const Reply = mongoose.model('Reply', ReplySchema);

module.exports = function (app) {

  app.route('/api/threads/:board') // Thread section...

  	.post((req, res) => {
  		let obj = req.body;
  		Board(req.params.board).create({
  			text : req.body.text,
  			delete_password: req.body.delete_password
  		}, (err, result) => {
  			if(err) return console.log('wrong board name');
  			res.redirect('/b/'+req.params.board);
  		});
  	})

  	.get((req, res) => {
  		let { board } = req.params;
  		Board(board).find({}, (err, result) => {
  			res.json(result);
  		})
  	})

  	.delete((req, res) => {
  		let { thread_id, delete_password } = req.body;
  		let { board } = req.params;

  		Board(board).findById(thread_id, (err, result) => {
  			if(!result) return res.send('id not valid');
  			if(delete_password !== result.delete_password) return res.send('incorrect password');
  			Board(board).deleteOne(result, () => {
  				res.send('success');
  			});
  		});
  	})

	.put((req, res) => {
		let { thread_id } = req.body;
		let { board } = req.params;
		Board(board).findById(thread_id, (err, result) => {
			if(!result) return res.send('id not valid');
			result.reported = true;
			result.save(() => {
				res.send('success');
			})
		});
	})



    
  app.route('/api/replies/:board') // The Replies Section

  	.post((req, res) => {
  		let { thread_id } = req.body;
  		let { board } = req.params;
  		let reply = new Reply({ 
        text: req.body.text, 
  			delete_password: req.body.delete_password 
  		});
  		Board(board).findById(thread_id, (err, result) => {
  			if(!result) return res.send('id could not be found');
  			result.replies.push(reply);
  			result.bumped_on = reply.created_on;
  			result.replycount = result.replies.length;
  			result.save((err, output) => {
  				res.redirect('/b/'+board+'/'+thread_id);
  			})
  		});
  	})

  	.get((req, res) => {
  		let { board } = req.params;
  		let { thread_id } = req.query;
  		Board(board).findById(thread_id, (err, result) => {
  			if(!result) return res.send('id could not be found');
  			res.json(result);
  		})
  	})

  	.delete((req, res) => {
  		let { thread_id, reply_id, delete_password } = req.body;
  		let { board } = req.params;

  		Board(board).findById(thread_id, (err, result) => {
  			if(!result) return res.send('id not valid');
  			if(delete_password !== result.delete_password) return res.send('incorrect password');
  			let replies = result.replies.map(obj => Object.assign({}, obj));
  			replies.find((a) => a._id == reply_id).text = '[deleted]';
  			result.replies = replies;
  			result.save((err, r) => {
  				res.send('success');
  			})
  		});
  	})

  	.put((req, res) => {
  		let { thread_id, reply_id } = req.body;
  		let { board } = req.params;

  		Board(board).findById(thread_id, (err, result) => {
  			if(!result) return res.send('id not valid');
  			let replies = result.replies.map(obj => Object.assign({}, obj));
  			replies.find((a) => a._id == reply_id).reported = true;
  			result.replies = replies;
  			result.save((err, r) => {
  				res.send('success');
  			})
  		})
  	})

};
