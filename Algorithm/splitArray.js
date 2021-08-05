let arrayToCheck = [1, 3, 3, 8, 4, 3, 2, 3, 3];

function canBeSplited(array) {
  if (array.length === 0) { return 0; }

  let sum = array.reduce((acc, cur) => acc + cur);
  let acc = 0;

  if (sum % 2 === 1) { return -1; }

  for (const el of array) {
    acc += el;
    sum -= el;
    if (sum === acc) { return 1; }
  }
  return -1;
}

console.log(arrayToCheck)
console.log(canBeSplited(arrayToCheck));

// [1 , 3 , 3 , 8 , 4 , 3 , 2 , 3 , 3]
// 1