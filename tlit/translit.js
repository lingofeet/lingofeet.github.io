// console.log("unicodedict array: " + unicodeDictArray)
var unicodeDict = new Map()
for (var entry of unicodeDictArray) {
//    console.log("unicodedict entry: " + entry)
    unicodeDict.set(entry[0], entry[1])
}

var kanjiDict = new Map()
for (var entry of kanjiDict) {
    kanjiDict.set(entry[0], entry[1])
}

function translit(oldTextContent) {
    if (!oldTextContent) {
	return ""
    }
    // insert blanks in chinese or thai
    var nblanks = (oldTextContent.match(/ /g) || []).length
    var insertBlanks = false
    
    // decompose string. compose again with String.normalize("NFC")
    oldTextContent = oldTextContent.normalize("NFD") // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize

    // insert zh and ja blanks beforehand
    oldTextContent = insertBlanksJaZh(oldTextContent)
    
    var newTextContent = ""

    for (var i = 0; i < oldTextContent.length; i++) {
	var c = oldTextContent.charAt(i)

/*	// on google page and latin? skip. latin replacements screw up the page, whyever
	if(tab_url.match(/[^\/]*google/) && c.match(/\p{Script=Latin}/u)) {
	    newTextContent += c
	    continue
	}*/

	// if touch latin is disabled in the preferences, skip latin
	// typeof(touchLatin) is string
	// \p{Script=Latin} matches umlaute, if the string is not normalized. \p{Block=CombiningDiacriticalMarks} funktioniert nicht in js, deshalb \u0300-\u036f
	// https://www.regular-expressions.info/unicode.html
	// \p unicode property
/*	if(touchLatin === "false") {
	    // if this character is latin or if this character is diacritic and last character was latin, skip
	    if (c.match(/\p{Script=Latin}/u) || (c.match(/[\u0300-\u036f]/u) && i > 0 && oldTextContent.charAt(i-1).match(/\p{Script=Latin}/u))) {
//	if(c.match(/\p{Script=Latin}/u) && touchLatin === "false") {
		newTextContent += c
		continue
	    }
	} */
	
	// insert greek h accent before last: from ohs to hos, from uhpo to hupo
	if (c.match(/\u0314/)) {
	    var l = newTextContent.length
	    // see https://stackoverflow.com/questions/4364881/inserting-string-at-position-x-of-another-string/4364902
	    newTextContent = newTextContent.substring(0, l-1) + unicodeDict.get(c) + newTextContent.substring(l-1)
	    continue
	}

	newC = c;
	if(unicodeDict.has(c)) {
	    newC = unicodeDict.get(c)
	} else {
//	    console.log(c + ' not in dict')
	}
	// japanese kanji? (the chinese glyphs in japanese language)
	if ( /[\u4e00-\u9fbf]/.test(c) && kanjiDict.has(c) && hasJapanese(oldTextContent)) {
	    newC = kanjiDict.get(c)
	}

/*	// chinese, and next character letter? insert blank
	if (/[\u3400-\u9FBF]/.test(c) && i < oldTextContent.length-1 && oldTextContent.charAt(i+1).match(/\p{Letter}/u)) {
	    newTextContent += " "
	} */

	newTextContent += newC


    }
    return newTextContent
}

// insertBlanksJaZh inserts blanks after chinese and japanese characters
function insertBlanksJaZh(s) {
    var out = ""
    for (var i = 0; i < s.length; i++) {
	var c = s.charAt(i)
	// number and last character chinese? insert blank
	if (c.match(/\p{N}/u) && i > 0 && s.charAt(i-1).match(/[\u3400-\u9FBF]/)) {
	    out += " "
	} 
	// japanese, hiragana, katakana, kanji? insert blanks.
	if (c.match(/\p{Script=Hiragana}/u) || c.match(/\p{Script=Katakana}/u) || c.match(/[\u4e00-\u9fbf]/)) {
	    out += " "
	}

	// chinese, and next character letter? insert blank
	if (/[\u3400-\u9FBF]/.test(c) && i < s.length-1 && s.charAt(i+1).match(/\p{Letter}/u)) {
	    out += " "
	}

	out += c
    }
    return out
}

// hasChinese returns if text has chinese characters
function hasChinese(text) {
    return text.match(/[\u3400-\u9FBF]/)
}
// hasJapanese returns if text has japanese characters
function hasJapanese(text) {
    return text.match(/\p{Script=Hiragana}/ug) || text.match(/\p{Script=Katakana}/ug)
}
