 
  
 
 import jwt from 'jsonwebtoken';

 const checkToken = (req, res, next)=>{
    //Extract the token from the browser set cookies
    const token = req.cookies.authToken;

    if(token) { 
    //verify and decode the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{

        if(err) {
            return res.redirect('/admin-control-login');
        }
 
        return res.redirect('/dashboard');   
         

    });
    
 };
 next();
};

 export default checkToken;