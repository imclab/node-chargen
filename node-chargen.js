#!/usr/bin/env node

var sys		= require('sys');
var http	= require('http'); 

var create	= function(opts){
	// alias opts for readability and default values
	var verbose	= opts['verbose'] || 0;
	// pattern which gonna be displayed
	var pattern	= "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefg";
	// create the http server
	var server	= http.createServer(function (request, response) {
		if( verbose > 0 )	console.log("Client connected");
		response.writeHead(200, {
			'Content-Type'		: 'text/plain',
			'Transfer-Encoding'	: 'identity'		// to force a non-chunked response
		});
		var nb_line	= 0;
		var stoploop	= false;
		// to findout when the client closes the connection
		request.connection.addListener('error', function(){
			stoploop	= true;
		});
		/**
		 * loop and deliver the usual chargen pattern until the end
		*/
		var main_loop	= function(){
			// if the client closes the connection, stop looping
			if(stoploop){
				if( verbose > 0 )	console.log("Client disconnected");
				response.end();
				return;
			}
			// compute the content to send
			var offset	= nb_line % pattern.length;
			var content	= pattern.substr(offset, pattern.length-offset) + pattern.substr(0, offset) + '\n';
			nb_line++;
			// write the content to the response
			response.write(content);
			// log to debug
			if( verbose > 1 )	console.log("One line written");
			// defer the next iteration 
			setTimeout(main_loop, 10);
		}
		// start looping
		main_loop();
	});
	// return the just-created server
	return server;
}

// export it via commonjs
exports.create	= create;


//////////////////////////////////////////////////////////////////////////////////
//		Main code							//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	var verbose	= 0;

	//////////////////////////////////////////////////////////////////////////////////
	//	parse cmdline								//
	//////////////////////////////////////////////////////////////////////////////////
	var optind	= 2;
	for(;optind < process.argv.length; optind++){
		var key	= process.argv[optind];
		var val	= process.argv[optind+1];
		//sys.puts("key="+key+" val="+val);
		if( key == "-v" || key == "--verbose" ){
			verbose		+= 1;
		}else if( key == "-h" || key == "--help" ){
			sys.puts("usage: node-chargen [-v]");
			sys.puts("");
			sys.puts("-v|--verbose\tIncrease the verbose level (for debug).");
			process.exit(0);
		}else{
			// if the option doesnt exist, consider it is the first non-option parameters
			break;
		}
	}

	opts	= {
		"verbose"	: verbose
	}
	server	= create(opts);
	server.listen(8124, "127.0.0.1");
	sys.puts('Server running at http://127.0.0.1:8124/');
}
