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
var Issue=require('../routes/issue.js')


chai.use(chaiHttp);

const createTestIssue = function(done, issue_title, cb) {
  const issue = new Issue({
    issue_title,
    issue_text: 'test-hook',
    created_by: 'test-hook',
    created_on:new Date(),
    updated_on:new Date(),
    assigned_to:'test-hook',
    status_text:'test-hook',
    open:true,
    project:'test'
  });
  issue.save()
    .then(function(rec) {      
      if (cb) cb(rec._id);
      done();
    })
    .catch(function(err) {
      console.error(err.message);
      done();
    });
}


const deleteTestIssue = function(done, filter) {
  const filterKey = Object.keys(filter)[0];
  Issue.findOneAndDelete(filter)
    .then(function(rec) {
      done();
    })
    .catch(function(err) {
      console.error(err.message);
      done();
    });
}

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      let issue_title = 'Title';

      after(function(done) {
        deleteTestIssue(done, { issue_title:issue_title });
      });
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          assert.equal(res.body.assigned_to, 'Chai and Mocha')
          assert.equal(res.body.status_text, 'In QA')
          //fill me in too!
          
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
       })
        .end(function(err,res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          done();
       })
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
             status_text: 'Functional Test - Missing required fields'
          })
          .end(function(err,res){
               assert.equal(res.status,200)
               assert.property(res.body,'message')
               assert.propertyVal(res.body,'message','missing required fields')
               done();
          })
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function(){
      let testId;
      var issue_title='Issue_Title'
      before(function(done){
         createTestIssue(done,issue_title,function(id){
            testId=id
            return;
         })
      })
      after(function(done){
        deleteTestIssue(done,{_id:testId})
      })
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
             _id:testId
          })
          .end(function(err,res){
            assert.equal(res.status,200)
            assert.equal(res.body.message,'no updated field sent')
            done();
          })
      });
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
             _id:testId,
             issue_title:'updated issue title'
          })
          .end(function(err,res){
            assert.equal(res.status,200)
            assert.equal(res.body.message,'successfully updated')
            done();
          })
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
             _id:testId,
             issue_title:'updated issue title',
             issue_text:'text'
          })
          .end(function(err,res){
            assert.equal(res.status,200)
            assert.equal(res.body.message,'successfully updated')
            done();
          })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      var issue_title='Issue_Title'
      before(function(done){
         createTestIssue(done,issue_title)
      })
      after(function(done){
        deleteTestIssue(done,issue_title)
      })
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({issue_title:'Title'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
       chai.request(server)
        .get('/api/issues/test')
        .query({issue_title:'Title',issue_text:"text"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      var issue_title='Issue_Title'
      let testId;
      before(function(done){
       createTestIssue(done,issue_title,function(id){
         testId=id
         return;
       })
      })
      test('No _id', function(done) {
        var id='fakeid';
        chai.request(server)
        .delete('/api/issues/test')
        .send({_id:id})
        .end(function(err,res){
           assert.equal(res.status,200)
           assert.equal(res.body.message,`failed could not delete id: ${id} `)
           done();
        })
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({_id:testId})
        .end(function(err,res){
           assert.equal(res.status,200)
           assert.equal(res.body.message,`success deleted id : ${testId} `)
           done();
        })
      });
      
    });

});
