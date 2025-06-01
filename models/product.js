import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({ 

    productName: {
        type: String,
        required: true,
    },  
 

    productDescription: {
        type: String,
        required: true,
    }, 

    priceuk: {
        type: String,
        required: true,
    }, 

    pricena: {
        type: String,
        required: true,
    },   

    category: {
        type: String,
        required: true,
    },    

    productWeight : {
        type: String,
        required: true, 
    }, 

    productLength : {
        type: String,
        required: true, 
    }, 
    
    productWidth : {
        type: String,
        required: true, 
    }, 
    
    productHeight : {
        type: String,
        required: true, 
    },

    review : {
         type : Number, 
    },
     
     
    productImage:[ 
        {
        originalname: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        path: { type: String, required: true }, 
    } 
],     


 

    variation : [
          
        {  
             sizes : [
                  {
                    sizeName : {
                         type : String,
                         required : true,
                    }, 
      
                    priceAdjustmentUk : {
                        type : String,
                        required : true, 
                     },

                    priceAdjustmentNa : {
                       type : String,
                       required : true,
                    }, 
                  },
             ],   
        },   

    ], 
    
    dateAdded: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('Product', productSchema);
export default Product;
