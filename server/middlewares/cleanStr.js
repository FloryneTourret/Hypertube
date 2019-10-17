const cleanStr = (str) => {
	let s2 = "";
	let alphanum = new RegExp("^[a-zA-Z0-9_]*$");
	for (var i = 0; i < str.length; i++) {
		if (alphanum.test(str[i]))
			s2 += str[i]
	}
	return (s2);
}

module.exports = cleanStr;