var http = require("http");

var _PORT = 80; //Http port Node.js server will be listening on. Make sure that this is an open port and its the same as the one defined in MT4 indicator/EA.


//Create the server and listening to the request
http.createServer(function onRequest(request, response) {
    request.setEncoding("utf8");
    var content = [];

    request.addListener("data", function(data) {
        content.push(data); //Collect the incoming data
    });


    //At the end of request call
    request.addListener("end", function() {
        //setup the response
        response.writeHead( 200, {"Content-Type": "text/plain"} );
        console.log("REQUEST \n\n",request);
        response.write("Connection OK!"); //Write the response
        response.end(); //Close the response

    });



}).listen(_PORT);

console.log("Node.js server listening on port "+ _PORT);