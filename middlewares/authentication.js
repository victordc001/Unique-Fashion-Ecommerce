 
 
 import jwt from 'jsonwebtoken'; 

 const authenticateToken = (req, res, next)=>{
    //Extract the token from the browser set cookies
    const token = req.cookies.authToken;

    if(!token) {
       return res.redirect('/login');
    }  

    //verify and decode the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{

        if(err) {
            return res.redirect('/login');
        }

        //attach the decoded user info to the request object
 
        res.locals.user = user;   
       

    });
      
    next();  
    
 };

 export default authenticateToken;