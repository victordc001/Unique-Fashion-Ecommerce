
import express from 'express'; 
import mongoose from 'mongoose';

const WishlistSchema =  new mongoose.Schema({
       wisher : {
          type : mongoose.Schema.Types.ObjectId,
          ref : 'Clients', //reference to the user model for easy population 
       }, 

       product : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'Product', 
       },   

        
      quantity : {
        type : Number, 
        default : 1,
  },  

  size : {
           type : String,
           required : true,
  },  

  totalprice : {
    type : String,
    required : true,   
  },
});  

 const Wishlist = mongoose.model('Wishlists', WishlistSchema);
 export default Wishlist;           