
import parsePropExpression from './parse-property-expression';

function createMultiSort(sorts) {
	var initialSort = function() { return 0; };
  
  return sorts.map(function(sort) {
  	var dir = 1;
  	var getProp;
  	switch(typeof sort) {
  		case 'string':
  			getProp = parsePropExpression(sort);
  			break;
  		case 'object':
  			getProp = parsePropExpression(sort.by);
  			dir = sort.direction;
  			break;
  		case 'function':
  			return sort;
  	}

  	return function(a, b) {
			var va = getProp(a);
			var vb = getProp(b);
			var z = va === vb ? 0 : (va > vb ? 1 : -1);
    	return z * dir;
		};
  }).reduce(function(tmp, sortFn){
    return function(a, b) {
      return tmp(a, b) || sortFn(a, b);
    };    
  }, initialSort);
}

export default function multiSort(arr, sorts) {  
  arr.sort(createMultiSort(sorts));
}