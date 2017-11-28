/*
*Variables relativas a selectores del dom
*/
var setting = $('#setting'),	
	controlador = $('.controlador'),
	pointer = $('.pointer')
	her = 0,
	i = 0,
	ctrlHeight = parseInt($(controlador).css('height'))
/*
*Variables de control
*/
var moveFlag = false, //Sirve para dejar de recontrolar la posicion de un pointer o de un nodo
	call = false, //para llamar a la funcion e inicie el movimiento circular
	gravity = false,
	mouseup_cont = 0,
	desplazar = false, //Sirve para indicar cuando se puede cambiar el tamaño del fill
	direction = '',
	zindex = 0,
	minifyFlag = true;
//otras variables
var cursor = 'url("media/img/system/',
	cursorRight = cursor + 'cursorRight.png"), auto',
	cursorLeft = cursor + 'cursorLeft.png"), auto',
	cursorTop = cursor + 'cursorTop.png"), auto',
	cursorDown = cursor + 'cursorDown.png"), auto',
	cursorRightTop = cursor + 'cursorRightTop.png"), auto',
	cursorRightDown = cursor + 'cursorRightDown.png"), auto',
	cursorLeftTop = cursor + 'cursorLeftTop.png"), auto',
	cursorLeftDown = cursor + 'cursorLeftDown.png"), auto';
	closeHand = cursor + 'closeHand.png"), auto';
	openHand = cursor + 'openHand.png"), auto';


function externalCntrl(y, i) {
	/*
	*la i indica que controlador se ha movido, siendo los pares para el radio (d1)
	*y los impares para la velocidad speed
	*
	*la y es cuando se ha movido
	*la speed más alta posible es 95 y la más baja 0
	*
	*El d1 maximo es 300 por defecto, pero se actualiza al radio inicial del objeto
	*y el min el radio del circulo principal
	*/
	//1º determinamos a que estamos haciendo referencia
	var obj = '',
		per = 0,
		maxD1 = 600,
		maxSpeed = 95,
		minD1 = mainR,
		y = ctrlHeight -y; 		
	switch(i){
		case 0:
		case 1:
			obj = trabajos;
			break;
		case 2:
		case 3:
			obj = contacto;
			break;
		case 4:
		case 5:
			obj = aplicaciones;
			break;
		case 6:
		case 7:
			obj = sobremi;
			break;
	}	
	maxD1 = obj.d1_init
	//var line = (i%2==0) ? obj.d1 : obj.speed
	// ya tenemos  a que circulo nos referimos

	//El porcentaje en el que nos movemos
	per = y*100/ctrlHeight;

	//Con el porcentaje calculamos el resultado
	if (i%2==0){ //el radio
		obj.extControl = true;
		obj.d1 = per*maxD1/100;	
	}
	else {//la velocidad
		obj.speed = maxSpeed - ((per)*(maxSpeed)/100);
		obj.speed += 10;
		if (obj.speed>maxSpeed-15){
			obj.entra = false;
			call = true;			
			log(obj.speed);
		}
		if (obj.speed>maxSpeed-19 && obj.speed<maxSpeed-16){						
			if (call){
				call = false;
				obj.entra = true;
				obj.rotateNode();
			}
		}
		
	}
}

/*
*Desbloquear el menu
*/

setting.click(function(){
	if (menu.css('display') == 'none'){
		menu.css('display', 'block')
		//$('#controlMenu').css({'height': '150px'})
	}
	else{
		menu.css('display', 'none')
		//$('#controlMenu').css({'height': '40px'})
	}
})

$('body').on('mousedown', '.pointer', function(){
	her = $(this);
	moveFlag = true;		
	i = $(this).index('.pointer');
	var top = parseInt($(controlador[i]).offset().top),
		bottom = top+ctrlHeight,
		height = parseInt(her.css('height'))
	menu.mousemove(function(event){
		if (moveFlag){
			y = event.pageY - top			
			y = (y+top<top) ? 0 : y			
			y = (y+top>bottom) ? bottom-top-height : y			
			her.css({'margin-top':y});			
			externalCntrl(y, i);
		}
	}).mouseup(function(){
        moveFlag=false;        
    });

});

$('body').on('mousedown', "[move='true']", function(){
	her = $(this);
	moveFlag = true;
	var x = 0,
		y = 0,		
		obj = {};
	$('#controlMenu').css('z-index', -6);
	her.css('cursor', closeHand);
	$svg.mousemove(function(event){
		if (moveFlag){
			x = event.pageX;
			y = event.pageY;
			obj = eval(her.attr('id'));
			obj.move(x, y);			
			gravity = true;
			for (var i = 0; i<gravityObject.length; i++){
				gravityObject[i].gravityForce(obj);
			}
			
		}
	}).mouseup(async function(){
		if (!moveFlag) return;
		her.css('cursor', 'inherit');
        moveFlag=false;
        if (typeof(obj.entra) !== 'undefined'){
        	obj.entra = true;
        	obj.recalcularPos()        	
        	await sleep(obj.speed);
        	obj.rotateNode();
        }
    	$('#controlMenu').css('z-index', 1)
    	gravity = false;
    	mouseup_cont++
    	for (var i = 0; i<gravityObject.length; i++){
			gravityObject[i].gravityAction(obj);				
		}
		return;        	
    })
	return;        	
});

$('body').on('dblclick', "[move='true']", async function(){
	her = $(this);
	obj = eval(her.attr('id'));
	obj.entra = false;
	obj.c.goTo(open.cx, open.cy, 1500)
	await sleep(1600)
	open.gravityActive = true;
	open.gravityAction(obj);
	open.gravityActive = false;
	obj.entra = true;
	obj.rotateNode();	

});

$('body').on('mousewheel DOMMouseScroll', '.fill', onScroll);
function onScroll(e, id = undefined){
	var id = (typeof(id) == 'undefined') ? $(this).attr('id') : id.slice(1);
	var d;
	if (e.wheelDelta) d = e.wheelDelta;
	if (e.originalEvent.detail) d = e.originalEvent.detail *-40;
	if (e.originalEvent && e.originalEvent.wheelDelta) d = e.originalEvent.wheelDelta;
	log(d);
	eval(id+'.scroll(d)')
}

$('body').on('mousemove', '.fill', function(e){
	var id = $(this).attr('id');
	direction = '';
	eval('var obj = '+id);
	desplazar = true;
	if (e.pageX >= obj.cordX +obj.w-obj.border && e.pageY <=obj.cordY+obj.border){
		direction = '';
		desplazar = false;
	}
	/*else if (e.pageX >= obj.cordX +obj.w-obj.border && e.pageY >=obj.cordY+obj.h-obj.border){
		$(this).css('cursor', cursorRightDown);
		direction = 'rightDown';
	}
	else if (e.pageX <= obj.cordX +obj.border && e.pageY <=obj.cordY+obj.border){
		$(this).css('cursor', cursorLeftTop);
		direction = 'leftTop';
	}
	else if (e.pageX <= obj.cordX +obj.border && e.pageY >=obj.cordY+obj.h-obj.border){
		$(this).css('cursor', cursorLeftDown);
		direction = 'leftDown';
	}*/
	else if (e.pageX >= obj.cordX +obj.w-obj.border){
		$(this).css('cursor', cursorRight);
		direction = 'right';
	}
	else if (e.pageX <= obj.cordX +obj.border){
		$(this).css('cursor', cursorLeft);
		direction = 'left';
	}
	else if (e.pageY >=obj.cordY+obj.h-obj.border){
		$(this).css('cursor', cursorDown);
		direction = 'down';
	}
	/*else if (e.pageY <=obj.cordY+obj.border && e.pageX <= obj.cordX + obj.w-50){
		$(this).css('cursor', cursorTop);
		direction = 'top';
	}*/
	else{
		$(this).css('cursor', 'inherit');
		desplazar = false;
		direction = '';
	}
});

$('body').on('mousedown', '.fill', function(e){
		if (!desplazar) return;
		var id = $(this).attr('id')
		eval ('var obj = '+id)
		var cords = [obj.cordX, obj.cordY, obj.w, obj.h];
		var flag = true;

		$('body').mousemove(function(e){
			if (!flag) return;
			switch (direction) {
				case 'rightTop':
					return;
					break;
				case 'leftTop':	
				case 'rightDown':
				case 'leftDown':
					cords = [(e.pageX-obj.cordX),(e.pageY-obj.cordY)];
					break;
				case 'right':
					obj.reStyle({'width': e.pageX-obj.cordX})
					log('{width: '+ obj.w+'+('+e.pageX+'-'+obj.cordX+'+'+obj.w+')}');
					log({'width': obj.w+(e.pageX-obj.cordX+obj.w)});
					break;
				case 'left':
					obj.reStyle({'left': e.pageX, 'width': (cords[2]+cords[0]-e.pageX)})
					break;
				case 'down':
					obj.reStyle({'height': e.pageY-obj.cordY})
					break;
				case 'top':
					cords = [e.pageY];
					break;
				default:
					return;
					break;
			}
		}).mouseup(function(){flag = false;})

}).mouseup(function(){flag = false;});



$('body').on('click', '.fill .close', function() {
	var id = $(this).parent().parent().attr('id');
	eval('var obj = '+id + ';');
	obj.close();
});

$('body').on('click', '.fill .minify', function() {
	var id = $(this).parent().parent().attr('id');
	eval('var obj = '+id + ';');
	obj.minify();
});

$('body').on('click', '.header .maximizy', function() {
	var id = $(this).parent().parent().attr('id');
	eval('var obj = '+id + ';');
	obj.maximizy();
});


$('body').on('mousedown', '.fill .header', function(e){
	if(e.target !== e.currentTarget) return;
	var id = $(this).parent().attr('id');
	eval('var obj = '+id + ';');
	var stop = false;
	var restX = (e.pageY-obj.cordY);
	var restY = (e.pageX-obj.cordX);
	$(this).css('cursor', closeHand);
	if (obj.big)
		obj.reStyle({'width': obj.w_init, 'height': obj.h_init});

	$('body').mousemove(function(e){
		if (stop) return;
		if (e.pageY <= 20){
			if($('#screenBlue').css('display') !== 'none' && $('#screenBlue').css('display') !== 'block')
				$('<div id="screenBlue" style = "height: '+h+'px"></div>').insertAfter($svg);
			else
				$('#screenBlue').css('display', 'block')
			
			$('#screenBlue').css({'width': 0, 'height': 0}).animate({'width': w*0.95+'px', 'height': h+'px'}, 500)
		}
		else
			$('#screenBlue').css({'width': '0px', 'height': '0px', 'display': 'none'})
		obj.reStyle({'top': (e.pageY-restX), 'left': (e.pageX-restY)})
	})
	.mouseup(function(e){stop = true; return;})


	}).on('mouseup', '.fill .header', function(e){
		if(e.target !== e.currentTarget) return;
		stop = true;
		var id = $(this).parent().attr('id');
		eval('var obj = '+id + ';');
		$(this).css('cursor', openHand);
		$('#screenBlue').css('display', 'none');
		if (e.pageY <=20)
			obj.maximizy();
});


$('body').on('click', '.fill', function(){
	var id = $(this).attr('id')
	eval('var obj ='+ id +';');
	zindex++
	obj.jqr.css('z-index', zindex)
});

$('body').on('mouseenter', '#minify', function() {
	minify.showAll();
});

$('body').on('click', '.second', function() {
	var id = $(this).attr('id').replace('Min', '');
	eval('var obj = ' +id);
	obj.jqr.css({'display': 'blok', 'left': minify.cx, 'top': minify.cy, 'width': 0, 'height': 0, 'opacity': 1})
			.animate({'left': obj.cordX, 'top': obj.cordY, 'width': obj.w, 'height': obj.h}, 1000);
	minify.secondPlane = minify.secondPlane.popMe(obj);
	$('.second').remove();
}).on('mouseover', '.second', function(){
	var id = $(this).attr('id').replace('Min', '');
	eval('var obj = ' +id);
	obj.jqr.css({'display': 'block', 'left': obj.cordX, 'top': obj.cordY, 'width': obj.w, 'height': obj.h, 'opacity': 0.6});
	$(this).css('opacity', 0.4);
}).on('mouseout', '.second', function(){
	var id = $(this).attr('id').replace('Min', '');
	eval('var obj = ' +id);
	obj.jqr.css({'display': 'none', 'left': minify.cx, 'top': minify.cy, 'width': 0, 'height': 0, 'opacity': 1});
	$(this).css('opacity', 1);	
});



//desktop.canMove();
minify.secondPlane = [];