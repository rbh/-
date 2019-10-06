// Registering service worker.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
};

// Make the app responsive.
function resize_handler() {
    var W = document.documentElement.clientWidth;
    var H = document.documentElement.clientHeight;
    var M;
    if (W < H) {
	document.body.classList.remove('landscape');
	document.body.classList.add('portrait');
	if ( W/4 < H/10 ) {
	    M = W/4;
	} else {
	    M = H/10;
	}
    } else {
	document.body.classList.remove('portrait');
	document.body.classList.add('landscape');
	if ( W/8 < H/6 ) {
	    M = W/8;
	} else {
	    M = H/6;
	}
    }
    document.body.style.fontSize = Math.round(0.3*M) + "pt";
}
window.addEventListener('resize', resize_handler);
resize_handler();

// Change settings.
function settings() {
    // Todo...
}

// Compute the probability of reusing the random number.
function time_to_p(t) {
    if (t < 150) {  // Short clicks will give independent rolls.
	return 0;
    } else {
	var x = (t-1000)/200;
	return 1/(1+Math.exp(-x));
    }
}

// Roll dice.
var last_random = Math.random();
function roll(x, y, z, t) {
    if (t <= 0) {
	t = 1;
    }
    var p = time_to_p(t);
    var rolls = [];
    var total = z;
    for (var i=0; i<x; i++) {    
	if (Math.random() < p) {
	    random = last_random;
	} else {
	    random = Math.random();
	    last_random = random;
	}
	r = Math.floor(y*random)+1
	rolls.push(r);
	total += r
    }
    return {
	'total': total,
	'rolls': rolls
    }
}


// Handle input.
var input_x = document.getElementById('input_x');
var input_D = document.getElementById('input_D');
var input_y = document.getElementById('input_y');
var input_plus_minus = document.getElementById('input_plus_minus');
var input_z = document.getElementById('input_z');
var output = document.getElementById('app_results');
var title = document.getElementById('app_title');

var last_key = '';
var last_key_ts = 0;
var key_elements = {
    '0': document.getElementById('app_0'),
    '1': document.getElementById('app_1'),
    '2': document.getElementById('app_2'),
    '3': document.getElementById('app_3'),
    '4': document.getElementById('app_4'),
    '5': document.getElementById('app_5'),
    '6': document.getElementById('app_6'),
    '7': document.getElementById('app_7'),
    '8': document.getElementById('app_8'),
    '9': document.getElementById('app_9'),
    'd': document.getElementById('app_D'),
    '+': document.getElementById('app_plus'),
    '-': document.getElementById('app_minus'),
    'Enter': document.getElementById('app_enter'),
    'Backspace': document.getElementById('app_backspace'),
    's': document.getElementById('app_settings')
};
var timer = 0;

// Remove last character from an element, and default to template if
// all characters have been removed.
function chop(element, template) {
    element.innerHTML = element.innerHTML.substring(0, element.innerHTML.length-1);
    if (! element.innerHTML) {
	element.innerHTML = template;
	element.classList.add('unset_var')
	return false;
    } else {
	return true;
    }
}

// Append a character to an element.
function append(element, key) {
    if (element.classList.contains('unset_var')) {
	element.classList.remove('unset_var');
	element.innerHTML = key;
	key_elements['0'].classList.remove('disabled');
    } else {
	element.innerHTML += key;
    }
}

// Handle a key press (either from the pointing device or the
// keyboard).
function press(key, t) {
    if (key == 's') {
	settings();
    } else if (key == '+' || key == '-') {
	if (! input_y.classList.contains('unset_var')) {
	    input_plus_minus.innerHTML = key;
	    input_plus_minus.classList.remove('unset');
	    input_z.innerHTML = 'z';
	    input_z.classList.add('unset_var');
	    key_elements['0'].classList.add('disabled');
	} else {
	    console.log('This should not happen.');
	}
    } else if (key == 'Backspace') {
	if (! input_z.classList.contains('unset_var')) {
	    if (! chop(input_z, 'z')) {
		key_elements['0'].classList.add('disabled');
	    }
	} else if (! input_plus_minus.classList.contains('unset')) {
	    input_plus_minus.innerHTML = '±';
	    input_plus_minus.classList.add('unset');
	    key_elements['0'].classList.remove('disabled');
	} else if (! input_y.classList.contains('unset_var')) {
	    if (! chop(input_y, 'y')) {
		key_elements['Enter'].classList.add('disabled');
		key_elements['+'].classList.add('disabled');
		key_elements['-'].classList.add('disabled');
		key_elements['0'].classList.add('disabled');
	    }
	} else if (! input_D.classList.contains('unset')) {
	    input_D.classList.add('unset');
	    key_elements['0'].classList.remove('disabled');
	} else if (! input_x.classList.contains('unset_var')) {
	    if (! chop(input_x, 'x')) {
		key_elements['Backspace'].classList.add('disabled');
		key_elements['0'].classList.add('disabled');
	    }
	} else {
	    console.log('This should not happen.');
	}
    } else if (key == 'd') {
	if (input_x.classList.contains('unset_var')) {
	    input_x.classList.remove('unset_var');
	    input_x.innerHTML = '1';
	}
	input_D.classList.remove('unset');
	key_elements['Backspace'].classList.remove('disabled');
	key_elements['Enter'].classList.add('disabled');
	key_elements['+'].classList.add('disabled');
	key_elements['-'].classList.add('disabled');
	key_elements['0'].classList.add('disabled');
	input_y.classList.add('unset_var');
	input_y.innerHTML = 'y';
	input_plus_minus.classList.add('unset');
	input_plus_minus.innerHTML = '±';
	input_z.classList.add('unset_var');
	input_z.innerHTML = 'z';
    } else if (key == 'Enter') {
	var x = parseInt(input_x.innerHTML);
	var y = parseInt(input_y.innerHTML);
	var z = 0;
	if (! input_z.classList.contains('unset_var')) {
	    z = parseInt(input_z.innerHTML);
	    if (input_plus_minus.innerHTML == '-') {
		z = -z;
	    }
	}
	result = roll(x, y, z, t);
	if (x > 1) {
	    output.innerHTML = '<span>' + result['rolls'].join('+&#8203;') + '</span><span style=\'font-size: 200%\'>=' + result['total'] + '</span>';
	} else {
	    output.innerHTML = '<span style=\'font-size: 200%\'>' + result['total'] + '</span>';
	}
    } else {  // key must be a number
	if (input_D.classList.contains('unset')) {
	    append(input_x, key);
	    key_elements['Backspace'].classList.remove('disabled');
	} else if (input_plus_minus.classList.contains('unset')) {
	    append(input_y, key);
	    key_elements['Enter'].classList.remove('disabled');
	    key_elements['+'].classList.remove('disabled');
	    key_elements['-'].classList.remove('disabled');
	} else {
	    append(input_z, key);
	}
    }
}

// Update the progress bar when the Enter key is pressed.
function progress() {
    var pct = Math.floor(100*time_to_p(Date.now() - last_key_ts));
    title.style = 'background: linear-gradient(to right, #0000ff, #0000ff ' + pct + '%, #0000bf ' + pct + '%, #0000bf 100%);';
}

// Handle when a a key is pressed down.
function down(key) {
    if (last_key) {
	if (key == last_key) {
	    return;
	}
	if (timer) {
	    clearInterval(timer);
	    timer = 0;
	    title.style = '';
	}
	key_elements[last_key].classList.remove('pressed');
    }
    if (key_elements.hasOwnProperty(key) && ! key_elements[key].classList.contains('disabled')) {
	key_elements[key].classList.add('pressed');
	last_key = key;
	last_key_ts = Date.now();
	if (key == 'Enter') {
	    timer = setInterval(progress, 10);
	}
    } else {
	last_key = '';
    }
}

// Handle when a key is released.
function up(key) {
    if (last_key) {
	key_elements[last_key].classList.remove('pressed');
	if (timer) {
	    clearInterval(timer);
	    timer = 0;
	    title.style = '';
	}
    }
    if (last_key == key && ! key_elements[key].classList.contains('disabled')) {
	press(key, Date.now() - last_key_ts);
    }
    last_key = '';
}

// Install event handlers for keyboard.
document.addEventListener('keydown', function(event) { down(event.key); });
document.addEventListener('keyup', function(event) { up(event.key); });

// Install event handlers for pointing device.
function makeDownHandler(key) {
    return function(event) { down(key); };
}
function makeUpHandler(key) {
    return function(event) { up(key); };
}
for (var key in key_elements) {
    element = key_elements[key];
    element.addEventListener("mousedown", makeDownHandler(key));
    element.addEventListener("mouseup", makeUpHandler(key));
}
