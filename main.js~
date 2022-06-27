function WordPair(langA, langB) {
    this.langA = langA
    this.langB = langB
}

var languages = [] // iso codes of available languages

var langASelect = document.getElementById("langA")
var langBSelect = document.getElementById("langB")
var langA, langB // iso-abbr of language

fetch('https://phrase-to-phrase.github.io/lingoriver-serve/lang.txt')
    .then(response => response.text())
    .then(text => {
	// fill language select
	languages = text.split("\n").filter(l => l.match(/\w/))
	languages.sort()
	for (var l of languages) {
	    var optionA = document.createElement("option")
	    optionA.value = l
	    optionA.textContent = isoLangNames[l] ? isoLangNames[l].toLowerCase() : l
	    langASelect.appendChild(optionA)
	    var optionB = document.createElement("option")
	    optionB.value = l
	    optionB.textContent = isoLangNames[l] ? isoLangNames[l].toLowerCase() : l
	    if (l == "en") { optionB.selected = true }
	    document.getElementById("langB").appendChild(optionB)
	}
	langASelect.addEventListener("change", function() {
	    startMeUp()
	})
	langBSelect.addEventListener("change", function() {
	    startMeUp()
	}) 

	// automatically show the first sentence
	startMeUp()
    })

//var goButton = document.getElementById("go-button")
var nextLangAs
var textTrain = null

/*goButton.addEventListener("click", function() {
    startMeUp()
})*/
			  
// startMeUp starts it up
function startMeUp() {
    if (textTrain) {
	// need to remove event listeners
	textTrain.close()
    } 
    textTrain = null
    nextLangAs = []
    sentenceIds = {}

    refillTextTrain()
}


// sentence ids in each language
var sentenceIds = {}


// fetchSentenceIds fetches and saves sentence ids in lang and calls callback
function fetchSentenceIds(lang, callback) {
    fetch('https://phrase-to-phrase.github.io/lingoriver-serve/in-language/' + lang + ".txt")
	.then(response => response.text())
	.then(text => {
	    var a = text.split("\n")
	    sentenceIds[lang] = new Set()
	    for (var id of a) {
		if (id.match(/[0-9]+/)) {
		    sentenceIds[lang].add(id)
		}
	    }
	    callback()
	})
}

var toFetch
// refillTextTrain refills the textTrain with new sentences
function refillTextTrain() {
    console.log("refilltexttrain")
    langB = document.getElementById("langB").value // the language the user knows
    langA = document.getElementById("langA").value // tne new language
    toFetch = new Set()
    if (!sentenceIds[langB]) {
	toFetch.add(langB)
    }
    
    // nextLangAs is filled to hold either a random lang for each index, or the same lang all the way through
    nextLangAs = []
    for (var i = 0; i < 3; i++) {
	var l = langA
	if (langA == "any") {
//	    console.log("here")
	    l = languages[Math.floor(Math.random()*languages.length)]
	    // avoid the same language for langA and langB
	    if (l == langB) {
		i-- // repeat this loop iteration
		continue
	    }
	    nextLangAs[i] = l
	} else {
	    nextLangAs[i] = langA
	}
	if (!sentenceIds[l]) {
	    toFetch.add(l)
	}
    }
    console.log("nextLangAs: " + nextLangAs)

    // no new sentence-per-language ids needed
    if (toFetch.size == 0) {
	continueAfterIdFetch()
	return
    }
    
    // get sentence ids for each new language
    for (l of toFetch) {
	console.log("toFetch: "+l);
	// fetch ids
	// new scope for l
	( function () {
	    var _l = l // local copy
	    fetchSentenceIds(l, function() {
		console.log("fetched: "+_l)

		toFetch.delete(_l)
		// if all fetches done, continue
		if (toFetch.size == 0) {
		    continueAfterIdFetch()
		}
	    })
	})()
    }

}


// continueAfterIdFetch is executed after sentence ids are fetched
var intersectionIds = [] // for each language, the intersecting sentences with langB
function continueAfterIdFetch() {

    console.log("continue after id fetch")
    // compute intersections of each upcoming language with langB
    for (var l of nextLangAs) {
	if (!intersectionIds[l]) {
	    intersectionIds[l] = intersection(sentenceIds[langB], sentenceIds[l])
	}

	var r = Math.floor(Math.random() * intersectionIds[l].length)
	var id = intersectionIds[l][r];
//	console.log("fetch sentence id: " + id)
	// new scope keep l in callback
	( function () {
	    var _langA = l
	fetch('https://phrase-to-phrase.github.io/lingoriver-serve/sentences/' + id + ".txt")
	    .then(response => response.text())
	    .then(text => {


		    //		console.log("text: " + text)
		var sentence = getSentencePair(text, _langA, langB)
		if (!sentence) {
		    return
		}
		
		console.log("sentence word pairs: " + sentence.wordPairs[0].langA)
		if (textTrain == null) {
		    textTrain = new TextTrain([sentence], refillTextTrain)
		    //			console.log("onSentenceNeed set")
		    //		    textTrain.onSentenceNeed = refillTextTrain()
		    //		    textTrain.onSentenceNeed = (function() { alert("needs sentences") } )()
		} else {
		    textTrain.pushSentence(sentence)
		}

	    })
	})()
	
    }
}

// intersection the intersection of two Sets as array
function intersection(setA, setB) {
    var inter = []
    for (var e of setA) {
	if (setB.has(e)) {
	    inter.push(e)
	}
    }
    return inter
}

// getSentencePair gets the sentence in langA and langB from text
function getSentencePair(text, langA, langB) {
    // get sentences
    var a = text.split("\n")
    var langASentence, langBSentence

//    console.log("langA: " + langA + " langB: " + langB)
    for (var l of a) {
	// skip empty line
	if (l.match(/^\s*$/)) { continue; }
	//		    console.log("line: " + l)
	var b = l.split("\t")

	if (b[0] == langA) langASentence = displayStrip(b[1])
	if (b[0] == langB) langBSentence = displayStrip(b[1])
    }

    // sometimes there is no langASentence or langBSentence
    // or sentence is only a description in [] brackets removed by displayStrip
    if (!langASentence || !langBSentence || !langBSentence.match(/\p{L}/u) || !langASentence.match(/\p{L}/u)) {
	return null
    }
    var wp = []

    //    var sentencePrep = translit(langASentence)
    //    var words = sentencePrep.split(/[^\p{L}\p{M}\p{N}]* +[^\p{L}\p{M}\p{N}]*/u)
    
    var words = insertBlanksJaZh(langASentence).split(/[^\p{L}\p{M}\p{N}]* +[^\p{L}\p{M}\p{N}]*/u)

    console.log("words: " + words)
    for (var s of words) {
	// skip if s has no letter
	if (!s.match(/\p{L}/u)) { continue }
	var b = ""
	if (jsonDict.dict[s]) {
	    b = jsonDict.dict[s][langA]
	    // take the first translation
	    if (b) { b = b.split(", ")[0] }
	}
	wp.push(new WordPair(s, (b ? b : "")))
    }
    var sentence = {
	langA: langASentence,
	langB: langBSentence,
	wordPairs: wp
    }
    return sentence
}

// displayStrip removes strings like &rlm; and | from sentence chunks that are displayed
function displayStrip(s) {
    s = s.replaceAll(/\[.*\]/g, "") // stuff in square brackets
    s = s.replaceAll(/\P{L}*$/gu, "") // non-letters at end
    s = s.replaceAll(/^-/g, "")
    s = s.replaceAll(/♪/g, "")
    s = s.replaceAll(/&.*;/g, "")
    s = s.replaceAll(/\|/g, "")
    return s
}


