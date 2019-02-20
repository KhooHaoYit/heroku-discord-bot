
function mineswipper(x, y, bombs){
	const amount = x * y;
	if(bombs >= amount){
		return '';
	}
	let field = [];
	for(let empty = amount; bombs; --bombs, --empty){
		let target = Math.floor(Math.random() * empty);
		let check = 0;
		do{
			if(field[check]){
				++target;
			}
			++check;
		}while(check <= target);
		field[target] = 9;
	}
	for(let check = amount; check; ){
		if(field[--check] < 9){
			continue;
		}
		for(let loop_y = 3, put_y = check / y; loop_y; --loop_y, put_y += y){
			if(put_y < 1 || put_y >= amount){
				continue;
			}
			for(let loop_x = 3, put_x = check % y - 1; loop_x; --loop_x, ++put_x){
				if(put_x < 1 || put_x >= x){
					continue;
				}
				field[put_y]
			}
		}
	}
	let output = '';
	
	return output;
}