/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    let thread_id;
    let thread_id2;

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {
        test('Post incomplete fields', function(done){
            chai.request(server)
                .post('/api/threads/:board')
                .send({
                    board: '',
                    text : 'Housing',
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'all fields are required');
                    done();
                });
        });
        

        test('Every field filled in', function(done){
            chai.request(server)
                .post('/api/threads/:board')
                .send({
                    board: 'Mark',
                    text : 'Housing',
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'text/html');
                    done();
                });
        });

        test('Every field filled in. (Testing)', function(done){
            chai.request(server)
                .post('/api/threads/:board')
                .send({
                    board: 'Mark',
                    text : 'Housing',
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'text/html');
                    done();
                });
        });
      
    });
    
    suite('GET', function() {

        test('Get all the general thread data', function(done){
            chai.request(server)
                .get('/api/threads/general')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'reported');
                    assert.property(res.body[0], 'replies');
                    assert.property(res.body[0], 'replycount');
                    assert.property(res.body[0], '_id')

                    thread_id = res.body[0]._id;

                    assert.property(res.body[0], 'board');
                    assert.property(res.body[0], 'text');
                    assert.property(res.body[0], 'delete_password');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'bumped_on');
                    done();
                });
        });

        test('Get threads data with a particular board name',function(done) {
            chai.request(server)
                .get('/api/threads/Mark')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[1], 'reported');
                    assert.property(res.body[1], 'replies');
                    assert.property(res.body[1], 'replycount');
                    assert.property(res.body[1], '_id')

                    thread_id2 = res.body[1]._id;

                    assert.property(res.body[1], 'board');
                    assert.property(res.body[1], 'text');
                    assert.property(res.body[1], 'delete_password');
                    assert.property(res.body[1], 'created_on');
                    assert.property(res.body[1], 'bumped_on');

                    assert.equal(res.body[1].reported, false);
                    assert.isArray(res.body[1].replies);
                    assert.equal(res.body[1].replycount, 0);
                    assert.equal(res.body[1].board, 'Mark')
                    assert.equal(res.body[1].text, 'Housing')
                    assert.equal(res.body[1].delete_password, 'password')
                    done();                   
                });
        })

    });
    
    suite('PUT', function() {
      
      test('Update with an invalid id', function(done){
        chai.request(server)
            .put('/api/threads/Mark')
            .send({ thread_id: 'wrong-thread-id' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'id not valid');
                done();
            });
      });

      test('Update with a wrong-board-name', function(done){
        chai.request(server)
            .put('/api/threads/wrong-board-name')
            .send({ thread_id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'wrong board name');
                done();
            });
      });

      test('Update with the correct inputs', function(done){
        chai.request(server)
            .put('/api/threads/Mark')
            .send({ thread_id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
            })
      });

    });
    
    suite('DELETE', function() {

        test('Delete a thread with wrong-id', function(done) {
            chai.request(server)
                .delete('/api/threads/Mark')
                .send({
                    thread_id : '89403884i30f',
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'id not valid');
                    done();
                });
        })


        test('Delete a thread with wrong-board-name', function(done) {
            chai.request(server)
                .delete('/api/threads/wrong-board-name')
                .send({
                    thread_id : thread_id,
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'wrong board name');
                    done();
                });
        });

        test('Delete a thread with the wrong-password', function(done) {
            chai.request(server)
                .delete('/api/threads/Mark')
                .send({
                    thread_id : thread_id,
                    delete_password: 'wrong-password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'incorrect password');
                    done();
                });
        });

        test('Delete a thread with the correct inputs', function(done) {
            chai.request(server)
                .delete('/api/threads/Mark')
                .send({
                    thread_id : thread_id,
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                });
        });

    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    let reply_id;

    suite('POST', function() {
        
        test('Post replies with wrong-thread-id', function(){
            chai.request(server)
                .post('/api/replies/Mark')
                .send({
                    board: 'Mark',
                    thread_id: 'wrong-thread-id',
                    text: 'Are you an agent? cos I will like to buy a new house.',
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'id could not be found');
                    done();
                });
        });

        test('Post replies with the wrong-board-name', function(){
            chai.request(server)
                .post('/api/replies/Mark')
                .send({
                    board: 'Mark',
                    thread_id: 'wrong-thread-id',
                    text: 'Are you an agent? cos I will like to buy a new house.',
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'wrong board name');
                    done();
                });
        });

        test('Post replies with the correct inputs', function(done){
            chai.request(server)
                .post('/api/replies/Mark')
                .send({
                    board: 'Mark',
                    thread_id: thread_id2,
                    text: 'Are you an agent? cos I will like to buy a new house.',
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'text/html');
                    done();
                });
        });
    });
    
    suite('GET', function() {

        test('Get replies with wrong-thread-id', function(done){
            chai.request(server)
                .get('/api/replies/Mark')
                .query({ thread_id: 'wrong-thread-id' })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'id could not be found');
                    done();
                });
        });

        test('Get replies with wrong-board-name', function(done){
            chai.request(server)
                .get('/api/replies/wrong-board-name')
                .query({ thread_id:  thread_id2 })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'wrong board name');
                    done()
                });
        });

        test('Get replies with the correct inputs', function(done){
            chai.request(server)
                .get('/api/replies/Mark')
                .query({ thread_id: thread_id2 })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.reported, false);
                    assert.isArray(res.body.replies);
                    assert.isNumber(res.body.replycount);
                    assert.equal(res.body.board, 'Mark');
                    assert.isString(res.body.text);
                    assert.isString(res.body.delete_password);

                    reply_id = res.body.replies[0]._id;

                    assert.property(res.body.replies[0], 'reported');
                    assert.property(res.body.replies[0], '_id')
                    assert.property(res.body.replies[0], 'board');
                    assert.property(res.body.replies[0], 'text');
                    assert.property(res.body.replies[0], 'delete_password');
                    assert.property(res.body.replies[0], 'created_on');
                    done();                   
                });
        });
    });
    
    suite('PUT', function() {

        test('Update replies with wrong-thread-id', function(done){
            chai.request(server)
                .put('/api/replies/Mark')
                .send({
                    thread_id: 'wrong-thread-id',
                    reply_id: reply_id
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'id not valid');
                    done();
                })          
        })

        test('Update replies with wrong-board-name', function(done){
            chai.request(server)
                .put('/api/replies/wrong-board-name')
                .send({
                    thread_id: thread_id2,
                    reply_id: reply_id
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'wrong board name');
                    done();
                })          
        })

        test('Update replies with the correct inputs', function(done){
            chai.request(server)
                .put('/api/replies/Mark')
                .send({
                    thread_id: thread_id2,
                    reply_id: reply_id
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                })          
        })
    });
    
    suite('DELETE', function() {

        test('Delete replies with wrong-thread-id', function(done){
            chai.request(server)
                .delete('/api/replies/Mark')
                .send({
                    thread_id: 'wrong-thread-id',
                    reply_id: reply_id,
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'id not valid');
                    done();
                });
        })

        test('Delete replies with wrong-board-name', function(done){
            chai.request(server)
                .delete('/api/replies/wrong-board-name')
                .send({
                    thread_id: thread_id2,
                    reply_id: reply_id,
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'wrong board name');
                    done();
                });
        })

        test('Delete replies with incorrect-password', function(done){
            chai.request(server)
                .delete('/api/replies/Mark')
                .send({
                    thread_id: thread_id2,
                    reply_id: reply_id,
                    delete_password: 'incorrect-password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'incorrect password');
                    done();
                });
        })

        test('Delete replies with the correct inputs', function(done){
            chai.request(server)
                .delete('/api/replies/Mark')
                .send({
                    thread_id: thread_id2,
                    reply_id: reply_id,
                    delete_password: 'password'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                });
        })
    }); 
  });
});
