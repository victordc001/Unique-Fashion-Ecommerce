import mongoose from 'mongoose';

const orderRequestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  }, 

  customer : { 
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Clients',  
  },
   
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  address1: {
    type: String,
    required: true,
  },
  address2: {
    type: String,
  },
  country: {
    type: String,
    default: 'United Kingdom',
  },
  city: {
    type: String,
    required: [ true, 'City is required' ],
  },
  state: {
    type: String,
    required : [ true, 'State is required' ],
  },
  zip: {
    type: String,
    required: [ true, 'Postal code is required'],
  },
  cartDetails: [
    {
      product : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product', 
      },       
   
      productName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,  
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      totalPrice: {
        type: String,
        required: true,
      },
      length: {
        type: String, // Length in cm
        required: true,
      },
      width: {
        type: String, // Width in cm
        required: true,
      },
      height: {
        type: String, // Height in cm
        required: true,
      },
      itemWeight: {
        type: String, // Weight in kg
        required: true,
      },
    },
  ],
  shippingFee: {
    type: String, 
    default : '0£',
  },
  ordreqStatus: {
    type: String,
    default: 'reviewing',
  },
  paymentStatus: {
    type: String,
    default: 'pending',
  }, 
  trackingCode: {
    type: String,
    default: 'pending',
  },  
    trackingState: {
  type: String, 
  default: 'static',
}, 
 deliveryMessage: {
  type: String, 
  default: '',
}, 
  trxRef: { 
    type: String, 
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

const OrderRequest = mongoose.model('OrderRequest', orderRequestSchema);
export default OrderRequest;
