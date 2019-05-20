/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;

var ObjectId = require('mongodb').ObjectID;
//var client=new MongoClient(process.env.DB,{useNewUrlParser:true})
//const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
var Issue=require('../routes/issue.js');


var randHex = function(len) {
  var maxlen = 8,
      min = Math.pow(16,Math.min(len,maxlen)-1) ,
      max = Math.pow(16,Math.min(len,maxlen)) - 1,
      n   = Math.floor( Math.random() * (max-min+1) ) + min,
      r   = n.toString(16);
  while ( r.length < len ) {
     r = r + randHex( len - maxlen );
  }
  return r;
};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var query=req.query;
      Issue.find(query,(err,data)=>{
         if(err){console.log("error"+err)}
         else{
            if(data==null){res.send('not found')}
            else{res.json(data)}
         }
      })
    })
    
    .post(function (req, res){
      var project = req.params.project.toString();
      var issues={
        _id:ObjectId(randHex(24)),
        issue_title:req.body.issue_title,
        issue_text:req.body.issue_text,
        created_by:req.body.created_by,
        assigned_to:req.body.assigned_to||'',
        status_text:req.body.status_text||'',
        created_on:new Date(),
        updated_on:new Date(),
        open:true,
        project:project
      }
      var issue=new Issue(issues)
      if(!issues.issue_title || !issues.issue_text || !issues.created_by){
          res.json({message:'missing required fields'})
      }else{
         issue.save((err,data)=>{
            if(err){console.log("error"+err)}
            else{res.json(issues)}
         })
        
        
      }
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var id=req.body._id;
      var hex=/[0-9A-Fa-f]/
      var updates={
        issue_title:req.body.issue_title||'',
        issue_text:req.body.issue_text||'',
        created_by:req.body.created_by||'',
        assigned_to:req.body.assigned_to||'',
        status_text:req.body.status_text||''
      }
      for(var prop in updates){
        if(updates[prop]==''){
          delete updates[prop]
        }
      }
      if(Object.keys(updates).length===0){
         res.json({message:'no updated field sent'})
      }else if(hex.test(id)&&id.length==24){
        updates.updated_on=new Date();
        updates.open=req.body.open === 'false'? false:true;
        Issue.findByIdAndUpdate(id,updates,{new:true},(err,data)=>{
           if(err){console.log('error'+err)}
           else{
              if(data==null){res.json({message:'could not update id'})}
              else{res.json({message:'successfully updated'})}
           }
        })
      }else{res.json({message:'could not update id'})}
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var id=req.body._id;
      var hex=/[0-9A-Fa-f]/;
      if(hex.test(id)&&id.length==24){
        Issue.findByIdAndRemove(id,(err,doc)=>{
        if(err){return err}
        else{if(doc==null){res.json({message:`failed could not delete id: ${id} `})}
             else{res.json({message:`success deleted id : ${id} `})}}
        })
     }
     else{res.json({message:`failed could not delete id: ${id} `})}
      })
    
};
