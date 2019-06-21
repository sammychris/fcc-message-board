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
	board: { type: String, required: true },
	text : { type: String, required: true },
	created_on: { type: Date, default: Date.now },
	bumped_on: { type: Date, default: Date.now },
	reported: { type: Boolean, default: false },
	delete_password: { type: String, required: true },
	replies: [],
	replycount: { type: Number, default: 0 }
})

const ReplySchema = new mongoose.Schema({
	board: { type: String, required: true },
	text : { type: String, required: true },
	created_on: { type: Date, default: Date.now },
	reported: { type: Boolean, default: false },
	delete_password: { type: String, required: true }
})

const Board = mongoose.model('Board', BoardSchema); 
const Reply = mongoose.model('Reply', ReplySchema);

module.exports = function (app) {

  app.route('/api/threads/:board') // Thread section...

  	.post((req, res) => {
  		let obj = req.body;
  		for(let key in obj) if(!obj[key]) return res.send('all fields are required');
  		new Board({
  			board: req.body.board,
  			text : req.body.text,
  			delete_password: req.body.delete_password
  		})
  		.save((err, result) => {
  			if(err) return console.error(err);
  			res.redirect('/b/'+req.params.board);
  		});
  	})

  	.get((req, res) => {
  		let board = req.params.board.trim();
  		board = board === 'general'? {}: { board };
  		Board.find(board, (err, result) => {
  			res.json(result);
  		})
  	})

  	.delete((req, res) => {
  		let { thread_id, delete_password } = req.body;
  		let { board } = req.params;

  		Board.findById(thread_id, (err, result) => {
  			if(!result) return res.send('id not valid');
  			if(board !== result.board) return res.send('wrong board name');
  			if(delete_password !== result.delete_password) return res.send('incorrect password');
  			Board.deleteOne(result, () => {
  				res.send('success');
  			});
  		});
  	})

	.put((req, res) => {
		let { thread_id } = req.body;
		let { board } = req.params;
		Board.findById(thread_id, (err, result) => {
			if(!result) return res.send('id not valid');
  			if(board !== result.board) return res.send('wrong board name');
			result.reported = true;
			result.save(() => {
				res.send('success');
			})
		});
	})



    
  app.route('/api/replies/:board') // The Replies Section

  	.post((req, res) => {
  		let id = req.body.thread_id;
  		let board = req.params.board;
  		let reply = new Reply({ 
  			board: board,
  			text: req.body.text, 
  			delete_password: req.body.delete_password 
  		});
  		Board.findById(id, (err, result) => {
  			if(!result) return res.send('id could not be found');
  			if(result.board !== reply.board) return res.send('wrong board name');
  			result.replies.push(reply);
  			result.bumped_on = reply.created_on;
  			result.replycount = result.replies.length;
  			result.save((err, output) => {
  				res.redirect('/b/'+board+'/'+id);
  			})
  		});
  	})

  	.get((req, res) => {
  		let board = req.params.board;
  		let _id = req.query.thread_id;
  		Board.findById(_id, (err, result) => {
  			if(!result) return res.send('id could not be found');
  			if(result.board !== board) return res.send('wrong board name');
  			res.json(result);
  		})
  	})

  	.delete((req, res) => {
  		let { thread_id, reply_id, delete_password } = req.body;
  		let { board } = req.params;

  		Board.findById(thread_id, (err, result) => {
  			if(!result) return res.send('id not valid');
  			if(board !== result.board) return res.send('wrong board name');
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

  		Board.findById(thread_id, (err, result) => {
  			if(!result) return res.send('id not valid');
  			if(board !== result.board) return res.send('wrong board name');
  			let replies = result.replies.map(obj => Object.assign({}, obj));
  			replies.find((a) => a._id == reply_id).reported = true;
  			result.replies = replies;
  			result.save((err, r) => {
  				res.send('success');
  			})
  		})
  	})

};
