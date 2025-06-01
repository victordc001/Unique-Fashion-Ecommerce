
import express from 'express';
import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    // The owner of the cart
    carter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clients',
        required: true,
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

    // Cart creation date
    createdAt: {
        type: Date,
        default: Date.now,
    },
 
});
 
const allCart = mongoose.model('Carts', CartSchema);
export default allCart;
