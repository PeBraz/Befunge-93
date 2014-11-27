(function() {
	//
	//	befunge 93 interpreter
	//


	var befunge = function (input,code){
	
		var _code = code.trim().split('\n');
		var _input = input;
		var _stack = [];
		var _border = {
			height: 0,
			width: 0
		}

		var _step = function (){

			var val = _get(_pointer.y, _pointer.x)
			var ins = _instructions[val];

			if (!ins)
				if (val)
					_stack.push(val)
				else _instructions[' ']();
			else ins();
			_pointer.direction();
		}

		var _pointer = {

			x:1,
			y:1,
			down: function (){
				if (this.y === _border.height-1) this.y = 1;
				else this.y += 1;
			},
			up: function (){
				if (this.y === 1) this.y = _border.height-1;
				else this.y -=1;
			},
			left: function (){
				if (this.x === 1) this.x = _border.width-1;
				else this.x -=1;
			},
			right: function(){
				if (this.x === _border.width-1) this.x = 1;
				else this.x +=1;	
			}
			
		};
		_pointer.direction = _pointer.right;

		var _mathOp = function (op){
				_stack.push(String(op(_stack.pop(),_stack.pop())));
			}

		var _instructions = {

			'+' : function () {
				_mathOp(function (a,b){ return parseInt(a)+parseInt(b); });
			},
			'-': function (){
				_mathOp(function (a,b){ return b-a; });
			},
			'/': function (){
				_mathOp(function (a,b){ return Math.floor(b/a); });	//if a = 0?
			},
			'*': function(){
				_mathOp(function (a,b){ return a*b; });
			},
			'%': function(){
				_mathOp(function (a,b){ return Math.floor(b%a); });
			},
			'!': function(){
				_stack.push(_stack.pop()?'1':'0');	//invert (only 0?)
			},
			'`': function(){
				_stack.push(_stack.pop()<_stack.pop()?'1':'0')
			},
			'>': function(){
				_pointer.direction = _pointer.right;
			},
			'<': function(){
				_pointer.direction = _pointer.left;
			},
			'^': function(){
				_pointer.direction = _pointer.up;
			},
			'v': function(){
				_pointer.direction = _pointer.down;
			},
			'?': function(){
				_pointer.direction = _pointer[['up','down','left','right'][Math.floor(Math.random()*4)]];
			},
			'_': function(){
				_pointer.direction = (_stack.pop() || '0') === '0'?_pointer.right:_pointer.left;
			},
			'|': function(){
				_pointer.direction = (_stack.pop() || '0') === '0'?_pointer.down:_pointer.up
			},
			'"': function(){
				while(true){
					_pointer.direction();
					var ele = _get(_pointer.y,_pointer.x);
					if (ele === '"')
						return
					_stack.push(ele);
				}
			},
			':': function(){
				var ele = _stack.pop();
				_stack.push(ele, ele);
			},
			'\\': function() {
				_stack.push(_stack.pop(), _stack.pop());
			},
			'$': function(){
				_stack.pop();
			},
			'.': function(){
				var ele = _stack.pop();
				console.log(isNaN(parseInt(ele))?(ele)?ele.charCodeAt(0):'':ele); 
			},
			',': function(){
				var ele = _stack.pop();
				process.stdout.write(isNaN(parseInt(ele))?String(ele):String.fromCharCode(ele)|| '');
			},
			'#': function() {
				_pointer.direction();
			},
			'p': function() {
				 //y,x,value
				_set(_stack.pop(), _stack.pop(), _stack.pop());
			},
			'g': function() {
				_get(_stack.pop(), _stack.pop());
			},
			'&': function() {
				_stack.push(_input.pop());
			},
			'~': function() {
				_stack.push(_input.pop());
			},
			'@': function() {
				process.exit(0);
			},
			' ':  function() {

			}
		}

		var _get = function (y,x) {
			return _code[y-1][x-1];
		}
		var _set = function (y,x,value) {
			_code[y-1][x-1] = value;
		}

		var _init = function(){

			if (!input || !code){
				throw {message: 'No Parameters found'};
			}

			_border.height = _code.length+1;
			_code.forEach(function(line) {
				if (line.length >=_border.width){
					_border.width = line.length+1;

				}
			});	
		};


		return {

			start: function () {
				try{
					_init();
				}catch(e){
					return console.log(e.message);
				}	
				var quit = 20;
				while(quit--){
					_step();	
				}

			}
		}
	}

	var readFile = function (filename, argsIndex) {
		code = require('fs').readFileSync(filename);
		if (!code){
			console.log("Error reading file");
			process.exit(1);
		}

		input = process.argv.slice(argsIndex);
		setTimeout(befunge(input,code.toString()).start,0);
	}


	//
	//
	//	Main Code 
	//
	//

	var code='';
	var input = '';

	for (var i = 2; i < process.argv.length ; i++){
		if (process.argv[i] === '--file')
			return readFile(process.argv[i+1],i+2)
	}

	console.log("[Befunge Interpreter]: Ctrl-D to feed input")
	input = process.argv.slice(2);

	process.stdin.on('data',function (data) {
		code+=data;
	});
		
	process.stdin.on('end',function (data) {

		setTimeout(befunge(input,code).start,0);
	});
		
	

	
})();