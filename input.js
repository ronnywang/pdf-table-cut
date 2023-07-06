var div_dom = null;
var status = '';
var line_dom = null;
var horizon_lines = [];
var vertical_lines = [];
var all_lines = {};
var table_dom = null;

var get_text = function(x, y, colspan, rowspan){
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    if (x == 0) {
        minx = div_dom.left;
    } else {
        minx = vertical_lines[x - 1].left;
    }

    if (y == 0) {
        miny = div_dom.top;
    } else {
        miny = horizon_lines[y - 1].top;
    }

    x += colspan;
    if (x == vertical_lines.length) {
        maxx = div_dom.left + div_dom.width;
    } else {
        maxx = vertical_lines[x].left;
    }

    y += rowspan;
    if (y == horizon_lines.length) {
        maxy = div_dom.top + div_dom.height;
    } else {
        maxy = horizon_lines[y].top;
    }

    var elements = document.querySelectorAll('p[class^="ft"]');
    var text = '';
    for (let element of elements) {
        let elementRect = element.getBoundingClientRect();
        var top = elementRect.top + scrollTop;
        var left = elementRect.left + scrollLeft;
        if (top < miny || top > maxy) {
            continue;
        }
        if (left < minx || left > maxx) {
            continue;
        }
        text += element.innerText;
    }
    return text;
};

var init_cross_count = function(){
    var elements = document.querySelectorAll('p[class^="ft"]');
    for (let element of elements) {
        element.cross_count = 0;
    }
}


var handle_mergecell = function(e){
    for (let x_y in all_lines) {
        var line_dom = all_lines[x_y];
        if (line_dom.style.border == '2px dashed red') {
            line_dom.style.border = line_dom.enabled ? '1px solid black' : '1px solid rgba(0, 0, 0, 0.05)';
        }
    }

    if (!e.target) {
        return;
    }
    if (!e.target.classList.contains('line')) {
        return;
    }
    e.target.style.border = '2px dashed red';
};

var check_overlap_p_box = function(way, start_x, start_y, length) {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

    var elements = document.querySelectorAll('p[class^="ft"]');
    for (let element of elements) {
        let elementRect = element.getBoundingClientRect();

        if (way == 'horizon') {
            if (start_y >= elementRect.top + scrollTop && start_y <= elementRect.bottom + scrollTop) {
                if (start_x + length >= elementRect.left + scrollLeft && start_x <= elementRect.right + scrollLeft) {
                    element.cross_count ++;
                }
            }
        } else if (way == 'vertical') {
            if (start_x >= elementRect.left + scrollLeft && start_x <= elementRect.right + scrollLeft) {
                if (start_y + length >= elementRect.top + scrollTop && start_y <= elementRect.bottom + scrollTop) {
                    element.cross_count ++;
                }
            }
        }
    }
};

var show_cross_p = function() {
    var elements = document.querySelectorAll('p[class^="ft"]');
    for (let element of elements) {
        if (element.cross_count) {
            element.style.background = 'yellow';
        } else {
            element.style.background = '';
        }
    }
};

var resize_table = function(e) {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

	div_dom.style.width = (scrollLeft + e.clientX - div_dom.left) + 'px';
	div_dom.style.height = (scrollTop + e.clientY - div_dom.top) + 'px';
	div_dom.width = scrollLeft + e.clientX - div_dom.left;
	div_dom.height = scrollTop + e.clientY - div_dom.top;

    init_cross_count();
    check_overlap_p_box('vertical', div_dom.left, div_dom.top, div_dom.height);
    check_overlap_p_box('vertical', div_dom.left + div_dom.width, div_dom.top, div_dom.height);
    check_overlap_p_box('horizon', div_dom.left, div_dom.top, div_dom.width);
    check_overlap_p_box('horizon', div_dom.left, div_dom.top + div_dom.height, div_dom.width);
    show_cross_p();
};

var move_horizon = function(e) {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

	if (Math.abs((scrollTop + e.clientY) - (div_dom.top + div_dom.height)) < 5) {
		line_dom.style.border = '2px solid';
		line_dom.style.top = div_dom.top + div_dom.height + 'px';
	} else {
		line_dom.style.border = '2px dashed red';
		line_dom.style.top = scrollTop + e.clientY + 'px';
        line_dom.top = scrollTop + e.clientY;
	}
	line_dom.style.height = '0px';

    init_cross_count();
    check_overlap_p_box('horizon', line_dom.left, line_dom.top, div_dom.width);
    show_cross_p();
};

var move_verticle = function(e) {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

	if (Math.abs((scrollLeft + e.clientX) - (div_dom.left+ div_dom.width)) < 5) {
		line_dom.style.border = '2px solid';
		line_dom.style.left = div_dom.left + div_dom.width + 'px';
	} else {
		line_dom.style.border = '2px dashed red';
		line_dom.style.left = scrollLeft + e.clientX + 'px';
        line_dom.left = scrollLeft + e.clientX;
	}
	line_dom.style.width = '0px';

    init_cross_count();
    check_overlap_p_box('vertical', line_dom.left, div_dom.top, div_dom.height);
    show_cross_p();
};

document.addEventListener('mousedown', function(e){
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

	if (null === div_dom) {
		div_dom = document.createElement('div');
		div_dom.style.position = 'absolute';
		div_dom.style.border = '2px dashed red';
		div_dom.style.top = scrollTop + e.clientY + 'px';
		div_dom.style.left = scrollLeft + e.clientX + 'px';
		div_dom.style['z-index'] = 9000;
		div_dom.top = scrollTop + e.clientY;
		div_dom.left = scrollLeft + e.clientX;

		document.body.appendChild(div_dom);

		document.addEventListener('mousemove', resize_table);
		resize_table(e);
		status = 'resizing';
	} else if (status == 'resizing') {
		div_dom.style.border = '2px solid';
		document.removeEventListener('mousemove', resize_table);
		status = 'horizon';
        horizon_lines = [];

		line_dom = document.createElement('div');
        line_dom.style['z-index'] = 10000;
		line_dom.style.position = 'absolute';
		line_dom.style.border = '2px dashed red';
		line_dom.style.left = div_dom.style.left;
		line_dom.style.width = div_dom.style.width;
        line_dom.left = div_dom.left;

		document.body.appendChild(line_dom);

		document.addEventListener('mousemove', move_horizon);
		move_horizon(e);
	} else if (status == 'horizon') {
		if (Math.abs((scrollTop + e.clientY) - (div_dom.top + div_dom.height)) < 5) {
			status = 'vertical';
			vertical_lines = [];

			line_dom.style.position = 'absolute';
			line_dom.style.border = '2px dashed red';
			line_dom.style.top = div_dom.style.top;
			line_dom.style.height = div_dom.style.height;
            line_dom.top = div_dom.top;

			document.removeEventListener('mousemove', move_horizon);
			document.addEventListener('mousemove', move_verticle);
			move_verticle(e);
			return;
		}
		line_dom.style.border = '1px solid';
		horizon_lines.push(line_dom);

		line_dom = document.createElement('div');
        line_dom.style['z-index'] = 10000;
		line_dom.style.position = 'absolute';
		line_dom.style.border = '2px dashed red';
		line_dom.style.left = div_dom.style.left;
		line_dom.style.width = div_dom.style.width;
        line_dom.left = div_dom.left;

		document.body.appendChild(line_dom);
	} else if (status == 'vertical') {
		if (Math.abs((scrollLeft + e.clientX) - (div_dom.left + div_dom.width)) < 5) {
            document.body.removeChild(line_dom);
            line_dom = null;
			status = 'merge-cell';

            var button_dom = document.createElement('button');
            button_dom.innerText = 'OK';
            div_dom.appendChild(button_dom);
            button_dom.addEventListener('click', function() {
                if (button_dom.innerText == 'OK') { 
                    div_dom.style.background = 'white';
                    div_dom.style['z-index'] = 20000;

                    var toggle_button_dom = document.createElement('button');
                    toggle_button_dom.innerText = 'Hide';
                    div_dom.appendChild(toggle_button_dom);
                    toggle_button_dom.addEventListener('click', function(){
                            if (toggle_button_dom.innerText == 'Hide') {
                                table_dom.style.display = 'none';
                                toggle_button_dom.innerText = 'Show';
                                div_dom.style.background = '';
                            } else {
                                table_dom.style.display = '';
                                toggle_button_dom.innerText = 'Hide';
                                div_dom.style.background = 'white';
                            }
                    });

                    table_dom = document.createElement('table');
                    table_dom.setAttribute('border', 1);
                    skip_cell = {};
                    for (var y = 0; y <= horizon_lines.length; y ++) {
                        var tr_dom = document.createElement('tr');

                        for (var x = 0; x <= vertical_lines.length; x ++) {
                            var colspan = rowspan = 0;
                            if ('undefined' !== typeof(skip_cell[x + '-' + y])) {
                                continue;
                            }

                            td_dom = document.createElement('td');
                            for (var cy = y; cy < horizon_lines.length && x <= vertical_lines.length && !all_lines['h' + x + '-' + cy].enabled; cy ++) {
                                rowspan ++;
                            }
                            for (var cx = x; cx < vertical_lines.length && y <= horizon_lines.length && !all_lines['v' + cx + '-' + y].enabled; cx ++) {
                                colspan ++;
                            }

                            if (rowspan) {
                                td_dom.setAttribute('rowspan', rowspan + 1);
                            }
                            if (colspan) {
                                td_dom.setAttribute('colspan', colspan + 1);
                            }
                            for (r = 0; r <= rowspan; r++) {
                                for (c = 0; c <= colspan; c++) {
                                    if (r == 0 && c == 0) {
                                        continue;
                                    }
                                    skip_cell[(x + c) + '-' + (y + r)] = true;
                                }
                            }
                            td_dom.innerText = get_text(x, y, colspan, rowspan);
                            tr_dom.appendChild(td_dom);
                        }
                        table_dom.appendChild(tr_dom);
                    }
                    div_dom.appendChild(table_dom);
                    button_dom.innerText = 'Copy';
                } else {
                    var range = document.createRange();  
                    window.getSelection().removeAllRanges()
                    range.selectNode(table_dom)
                    window.getSelection().addRange(range);
                    document.execCommand("copy");
                }
            });

            // split horizon_lines and vertical_lines to 
            vertical_lines = vertical_lines.sort(function(a, b) { return a.left - b.left; });
            horizon_lines = horizon_lines.sort(function(a, b) { return a.top - b.top; });

            for (var x in vertical_lines) {
                l = vertical_lines[x];
                var top = div_dom.top;
                for (var y = 0; y < horizon_lines.length; y ++) {
                    line_dom = document.createElement('div');
                    line_dom.style['z-index'] = 10000;
                    line_dom.style.position = 'absolute';
                    line_dom.style.border = '1px solid';
                    line_dom.style.top = top + 'px';
                    line_dom.style.height = (horizon_lines[y].top - top) + 'px';
                    line_dom.style.left = l.style.left;
                    line_dom.style.width = 1;
                    line_dom.classList.add('line');
                    line_dom.enabled = true;
                    line_dom.line_info = ['vertical', l.left, top, horizon_lines[y].top - top];

                    document.body.appendChild(line_dom);
                    all_lines['v' + x + '-' + y] = line_dom;
                    top = horizon_lines[y].top;
                }
                line_dom = document.createElement('div');
                line_dom.style['z-index'] = 10000;
                line_dom.style.position = 'absolute';
                line_dom.style.border = '1px solid';
                line_dom.style.top = top + 'px';
                line_dom.style.height = (div_dom.top + div_dom.height - top) + 'px';
                line_dom.style.left = l.style.left;
                line_dom.style.width = 1;
                line_dom.classList.add('line');
                line_dom.enabled = true;
                line_dom.line_info = ['vertical', l.left, top, div_dom.top - div_dom.height - top];

                document.body.appendChild(line_dom);
                all_lines['v' + x + '-' + y] = line_dom;

                document.body.removeChild(l);
            }
            for (var y in horizon_lines) {
                l = horizon_lines[y];
                var left = div_dom.left;
                for (var x = 0; x < vertical_lines.length; x ++) {
                    line_dom = document.createElement('div');
                    line_dom.style['z-index'] = 10000;
                    line_dom.style.position = 'absolute';
                    line_dom.style.border = '1px solid';
                    line_dom.style.left = left + 'px';
                    line_dom.style.width = (vertical_lines[x].left - left) + 'px';
                    line_dom.style.top = l.style.top;
                    line_dom.style.height= 1;
                    line_dom.classList.add('line');
                    line_dom.enabled = true;
                    line_dom.line_info = ['horizon', left, l.top, vertical_lines[x].left - left];

                    document.body.appendChild(line_dom);
                    all_lines['h' + x + '-' + y] = line_dom;
                    left = vertical_lines[x].left;
                }
                line_dom = document.createElement('div');
                line_dom.style['z-index'] = 10000;
                line_dom.style.position = 'absolute';
                line_dom.style.border = '1px solid';
                line_dom.style.left = left + 'px';
                line_dom.style.width = (div_dom.left + div_dom.width - left) + 'px';
                line_dom.style.top = l.style.top;
                line_dom.style.height = 1;
                line_dom.classList.add('line');
                line_dom.enabled = true;
                line_dom.line_info = ['horizon', left, l.top, div_dom.left + div_dom.width - left];

                document.body.appendChild(line_dom);
                all_lines['h' + x + '-' + y] = line_dom;

                document.body.removeChild(l);
            }

            document.removeEventListener('mousemove', move_verticle);
            document.addEventListener('mousemove', handle_mergecell);
            handle_mergecell(e);

            init_cross_count();
            for (let x_y in all_lines) {
                line_dom = all_lines[x_y];
                if (!line_dom.enabled) {
                    continue;
                }
                check_overlap_p_box(line_dom.line_info[0], line_dom.line_info[1], line_dom.line_info[2], line_dom.line_info[3]);
            }
            show_cross_p();

			return;
		}
		line_dom.style.border = '1px solid';
		vertical_lines.push(line_dom);

		line_dom = document.createElement('div');
        line_dom.style['z-index'] = 10000;
		line_dom.style.position = 'absolute';
		line_dom.style.border = '2px dashed red';
		line_dom.style.top = div_dom.style.top;
		line_dom.style.height = div_dom.style.height;

		document.body.appendChild(line_dom);
	} else if (status == 'merge-cell') {
        for (let x_y in all_lines) {
            line_dom = all_lines[x_y];
            if (line_dom.style.border == '2px dashed red') {
                line_dom.style.border = '1px solid';
            }
        }

        if (!e.target) {
            return;
        }
        if (!e.target.classList.contains('line')) {
            return;
        }
        e.target.enabled = !e.target.enabled;
        e.target.style.border = e.target.enabled ? '1px solid black' : '1px solid rgba(0, 0, 0, 0.05)';
        init_cross_count();
        for (let x_y in all_lines) {
            line_dom = all_lines[x_y];
            if (!line_dom.enabled) {
                continue;
            }
            check_overlap_p_box(line_dom.line_info[0], line_dom.line_info[1], line_dom.line_info[2], line_dom.line_info[3]);
        }
        show_cross_p();
	}
});
