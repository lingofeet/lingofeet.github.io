// ui and translate kickoff, started by main.js 

function TextTrain(sentences, onSentenceNeed) {

    //    this.onSentenceNeed = null // called when sentences batch is empty
    this.close = close
    this.pushSentence = pushSentence

    var trainSentenceIndex = 0
    var wordIndex = 0

    var clearInputOnInput = false

    var suggestionsE
    var langASentenceE
    var langBSentenceE
//    var inputDoneE
    var inputE
//    var placeholderE

    //    startButton.style.display = "none"
    //var doorUI = document.getElementById("ht-door")
    //doorUI.style.display = "none"

    // ui
//    var html = ''

//    var displayMode = 1 // 0: whole sentence printed, type in middle, 1: whole sentence as placeholder

    var container = document.getElementById("container")

    inputE = document.getElementById("editspan")
//    placeholderE = document.getElementById("persistent-placeholder")
//    inputDoneE = document.getElementById("tt-input-done")
    var moveWithInputE = document.getElementById("move-with-input")
    langBSentenceE = document.getElementById("tt-lang-b")
    langASentenceE = document.getElementById("tt-lang-a")
    suggestionsE = document.getElementById("suggestions")
//    helpE = document.getElementById("tt-help")
    var closeButton = document.getElementById("tt-close")

    // ui final touches
    inputE.focus()
    startTranslateWait()

    kickOff()

    // handle normal input
    inputE.addEventListener("input", handleInput)
    
    // handleInput listens to input on inputE
    function handleInput(event) {
        var s = inputE.textContent
	console.log("input: '" + s.charAt(s.length-1) + "'")
        // word break
        if (s.charAt(s.length-1).match(/\s/)) {
	    console.log("word break")
            handleWordBreak()
        }
    }

    inputE.addEventListener("keydown", handleKeydown)
    // handleKeydown listenes for keydowns on inputE
    function handleKeydown(event) {

	console.log("key down")
	document.getElementById("start-tip").style.display = "none"
        if (event.code == "Tab") {     // skip sentence
	    event.preventDefault()
            if(hasNextSentence()) {
                nextSentence()
                inputE.focus()
            } else {
                close()
            }
        } else if (event.code == "Escape") { // exit
            close()
        } else if (event.code == "Enter") { // word break
            handleWordBreak()
        }
//	console.log(event.code)

	if (inputBlocked) {
	    // if backspace, reopen input
	    if (event.code == "Backspace") {
		inputBlocked = false
	    } else {
		// block input
		event.preventDefault()
	    }
	}
    }

/*    helpE.addEventListener("click", function() {
        alert("Retype the second sentence. \n Keyboard shortcuts: \n tab - skip sentence \n escape - quit")
    }) */

    // pushSentence lets the caller add new sentences
    function pushSentence(s) {
	sentences.push(s)
    }

    // kickOff starts the data retrieving
    // returns false if no start, else true
    function kickOff() {
//      swd = new SentenceWordData()
//      swd.FillWithChapterString()

        // hacky, maybe on file loaded etc
//        nextSentenceTranslated()

	document.getElementById("start-tip").textContent = "[repeat the second line]"

	inputE.focus()
	
	updateTrainSentence()
        updateSuggestions()

/*      if (swd.SentenceN > 0) {
            //            swd.onSentenceTranslated = nextSentenceTranslated
            return true
        }
        return false */
    }

    // handleWordBreak takes care of words the user enters
    var inputBlocked = false
    function handleWordBreak() {
        if(!sentences[trainSentenceIndex]) {
            console.log("no sentence")
            return
        }
        var wps = sentences[trainSentenceIndex].wordPairs
        // input does not match source
        var userIn = inputE.textContent.trim()
        //        var check = wordTranslitForUser(wps[wordIndex].Hebrew)
        var check = wps[wordIndex].langA
        if (userIn !== check &&
	    userIn.replaceAll(/[^a-zA-Z]/g, "") != translit(check).replaceAll(/[^a-zA-Z]/g, "")) {
            console.log("input '"+userIn+"' does not match source '"+check+"'")
	    inputBlocked = true
            return
        }
	// word matches, if input blocked, unblock
	inputBlocked = false

	//            inputDoneE.innerHTML +=  translit(check) + " "
	//	    inputDoneE.innerHTML +=  userIn + " "
	// use single spans for linebreaks to work
	var span = document.createElement("span")
	span.className = "tt-input-done"
	span.innerHTML = userIn + " "
	moveWithInputE.parentNode.insertBefore(span, moveWithInputE)

        // continue with...
        if (wordIndex < wps.length - 1) {     // ...next word
            wordIndex++
            inputE.textContent = ""
            updateSuggestions()
        }  else if (hasNextSentence()) {     // ...next sentence
            nextSentence()
            updateSuggestions()

        }
        else {      // ...done, should be prevented through needsSentences
            close()
        }

    }

    // hasNextSentence: is there a next sentence?
    function hasNextSentence() {
        return trainSentenceIndex < sentences.length - 1
    }

    // close closes the ui
    function close() {

	console.log("close")
	// to get a fresh instance of textTrain, it is not enough to set textTrain = null
	// either remove listeners, or tear down textTrain ui and load it again?
	inputE.removeEventListener("input", handleInput)
	inputE.removeEventListener("keydown", handleKeydown) 

	// remove container
	//        container.parentNode.removeChild(container)

	
        // show start ui with start button
//        doorUI.style.display = "inline"

        trainSentenceIndex = 0
        wordIndex = 0

/*      if(swd) {
            swd.CloseMethod()
            swd = null
        }*/

    }

/*    var secondTimeE = document.getElementById("second-time")

    // quick and dirty second-time listener, no checking
    secondTimeE.addEventListener("keydown", function (e) {
	if (e.code == "Enter") {
	    secondTimeE.value = ""
	    if (hasNextSentence()) {
		nextSentence()
		inputE.focus()
	    }
	}
    })*/
    
    var repeat = true // next sentence is repeat of current sentence
    // display the next sentence and refill if sentences run empty
    function nextSentence() {

	// ask for refill if sentences run low
	if (sentences.length - trainSentenceIndex <= 2) {//  && this.onSentenceNeed) {
	    console.log("has sentence need")
	    onSentenceNeed()
	}


        inputE.textContent = ""
        wordIndex = 0

	 trainSentenceIndex++
	/* if (repeat == false) {
            trainSentenceIndex ++
	    repeat = true
	} else {
	    repeat = false
	    // type sentence a second time
            // insert line break
	    var brElement = document.createElement("span")
	    brElement.className = "tt-input-done"
//	    brElement.innerHTML = "<br/>"
	    brElement.style.display = "block" // otherwise no line break visible
	    moveWithInputE.parentElement.insertBefore(brElement, moveWithInputE)
	    return
	} */

        updateTrainSentence()
        // translation not yet available
/*      if (trainSentenceIndex > sentences.length - 1) {
//            console.log("translation not yet there")
            swd.onSentenceTranslated = nextSentenceTranslated()
            startTranslateWait()
        } else {
            updateTrainSentence()
        } */
    }

    // update the query sentence
    function updateTrainSentence() {
        var sentence = sentences[trainSentenceIndex]

	//      stopTranslateWait()

	// clear input done
	var spans = document.getElementsByClassName("tt-input-done")
	while (spans.length > 0) {
	    spans[0].parentNode.removeChild(spans[0])
	}
	//        inputDoneE.innerText = ""
	
        // remember to hide langA and keep langB
        clearInputOnInput = true

        if (!sentence) {
            console.log("error no sentence")
	    if (hasNextSentence()) { nextSentence() }
            return
        }

        // get word boundaries for chinese.
        // todo maybe: for chinese, thai, etc stick words together, else translit sentence to keep punctuation?
/*        var langA = ""
        for (var w of sentence.wordPairs) {
            //            langA += wordTranslitForUser(w.Hebrew) + " "
            langA += w.Hebrew + " "
            } */
        // translit? or ist this too much?
//      langB += "<br/>hineh yhvh boqeq ha???arets ubolqah ve???ivah faneha veheifits yoshebeha."
//      langB = translit(sentence.english) // maybe todo: same for langB as for langA?

        //      langBSentenceE.innerText = langB

/*        switch (displayMode) {
          case 0: */

	var langA = sentence.langA
        var langB = sentence.langB

	//	langASentenceE.innerText = translit(langA)
	// word by word, that arabic order is preserved
	langASentenceE.innerText = ""
	for (var wp of sentence.wordPairs) {
	    console.log(wp.langA)
	    //	    langASentenceE.textContent += translit(wp.langA) + " "
	    langASentenceE.textContent += wp.langA + " "
	}
	//	langBSentenceE.innerHTML = translit(langB)
	langBSentenceE.innerHTML = langB


    }

    // generateSuggestions generates suggestions
    function generateSuggestions() {
	
	// leave blank
	return ""

	
	
        if (!sentences[trainSentenceIndex]) { // not so cool, but at least avoid crash when current sentence is undefined?
            return ""
        }

        var string = ""
        // three next
        var wp = sentences[trainSentenceIndex].wordPairs
        for(var n = 0; n < 3 && wordIndex + n < wp.length; n++) { // three suggestions
        // for(var n = 0; n < 1 && wordIndex + n < words.length; n++) { // one suggestion
//            if (swd.wordDict[words[wordIndex+n]]) {
                // add langB
	    //              var langB = swd.wordDict[words[wordIndex+n]]
	    var langB = wp[wordIndex+n].langB
	    string += translit(langB) + " "
	    // string += translit(langB) + " "

            // add langA
            var langA = wp[wordIndex+n].langA
	    //            string += wordTranslitForUser(langA) + "<br/>"
	    string += translit(langA) + "<br/>"
        }
        return string

        // simple
        //    return target[1] + " " + target[0] + "<br/>"
    } 

    // for single word s, remove blanks between syllables, e.g. chinese
/*    function wordTranslitForUser(s) {
        return translit(s).replace(/\s/g, "")
    } */

    // clearNonLetters removes non letters
    function clearNonLetters(s) {
        return s.replace(/\P{Letter}/ug, "")
    }

    function startTranslateWait() {
//      console.log("start translate wait")
        // show wait message
        //      inputE.placeholder = "translating words..."
//        placeholderE.value = "translating words..."
    }
    function stopTranslateWait() {
        // hide wait message
        //      inputE.placeholder = ""
        placeholderE.value = ""
    }

    // if translation
/*    function nextSentenceTranslated() {
//      stopTranslateWait()


        // remove listener
//      swd.onSentenceTranslated = null
    }  */

    // in-place shuffle
    function shuffle(array) {
        array.sort((a, b) => Math.random() - 0.5)
    }



    // update the three suggestions
    // and maybe input placeholder
    function updateSuggestions() {
        //    suggestionsE.innerHTML = generateSuggestions(train[trainSentenceIndex].wordPairs, wordIndex)
        // inputE.placeholder = train[trainSentenceIndex].wordPairs[wordIndex][1]

        // below
      suggestionsE.innerHTML = generateSuggestions()

        // try out: placeholder

/*        if (!sentences[trainSentenceIndex]) { // not so cool, but at least avoid crash when current sentence is undefined?
            return 
        }
        var wordPairs = sentences[trainSentenceIndex].wordPairs

        // langB
        var langB = wordPairs[wordIndex].langB
	//      langB = translit(langB)
        // langA
        var langA = wordPairs[wordIndex].langA
//      langA = wordTranslitForUser(langA) 

        //      inputE.placeholder = langA + " " + langB */
/*        switch (displayMode) {
        case 0:
            placeholderE.value = langA + " " + langB
            suggestionsE.style.display = "none"
            break
        case 1:
            suggestionsE.textContent = langB
        }*/
    }

    // remove diacritics in string s
    function clearDiacritics(s) {
        s = s.normalize("NFD")
        return s.replace(/\p{Diacritic}/ug, "")
    }

    function ttInput(text) {
        console.log("input " + text)
    }
}
