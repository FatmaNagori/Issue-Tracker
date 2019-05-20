var mongoose=require('mongoose');
mongoose.connect(process.env.DB,{useNewUrlParser:true,useFindAndModify:false})
const Schema=mongoose.Schema;
const issueSchema=new Schema({issue_title:String,issue_text:String,created_by:String,assigned_to:String,status_text:String,created_on:Date,updated_on:Date,open:Boolean,project:String})
const Issue=mongoose.model('Issue',issueSchema);

module.exports = Issue;
