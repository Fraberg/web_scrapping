// https://www.levillagebyca.com/index.php/fr/startups

// get companies div
var vs = document.getElementsByClassName("container-vignette");
console.log(vs.length)
// for each company:
for (var i = 0; i < vs.length; i++) {
    var title = vs.item(i).getElementsByClassName("vignette-title")
    console.log(title[0].innerText)
    var desc = vs.item(i).getElementsByClassName("vignette-description")
    console.log(desc[0].innerText)
    var desc = vs.item(i).getElementsByClassName("vignette-button")
    console.log(desc[0].href)
}






