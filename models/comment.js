 

import express from 'express'; 
import mongoose from 'mongoose';   

 const CommentSchema = new mongoose.Schema({

      txtbodyy : {
         type : String,
         required : true,
      },  

      
      post : {
          type : mongoose.Schema.Types.ObjectId,
          ref : 'Onoscoblog', //reference to the post model
          required : true,
      }, 

      user : {
          type : mongoose.Schema.Types.ObjectId,
          ref : 'Clients', // reference to the user model
          required : true,
      },  

      parentComment : {
          type : mongoose.Schema.Types.ObjectId,
          ref : 'Comments', //self reference also called recursive or hierarchical pattern
          default : null,  //assuming this is a toplevel comment
      },

    
 });

 const Comment = mongoose.model('Comments', CommentSchema);
 //module.exports = Comment;
 export default Comment;

 