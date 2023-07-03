import './drawmap.css'
import './style.css'
import './node_modules/bootstrap/dist/css/bootstrap.min.css'
import './node_modules/bootstrap-icons/font/bootstrap-icons.min.css'

import { DrawMap } from '/drawmap.js'
let dm = new DrawMap("main")

dm.onLoad = () => {
    document.getElementById("fileurl").value = dm.fileurl;
    document.getElementById("work").style.display = "block";
    rectBut.classList.add("active");
    polygonBut.classList.remove("active");
    circleBut.classList.remove("active");
    document.getElementById("result").value = "";

}

const textinfo = document.getElementById("textinfo");
const urlinfo = document.getElementById("urlinfo");
const targetinfo = document.getElementById("targetinfo");

const loadBut = document.getElementById("loadBut");
loadBut.addEventListener("click", () => {
    dm.loadImage();
});

const loadButWeb = document.getElementById("loadButWeb");
loadButWeb.addEventListener("click", () => {
    dm.fileurl = document.getElementById("fileurl").value;
    dm.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dm.fileurl);
    dm.buferImage.src = dm.fileurl;

});

const delBut = document.getElementById("del");
delBut.addEventListener("click", () => {
    dm.delete();

});

const circleBut = document.getElementById("circle");
circleBut.addEventListener("click", () => {
    dm.action = "add";
    dm.mode = "circle";
    circleBut.classList.add("active");
    polygonBut.classList.remove("active");
    rectBut.classList.remove("active");

});


const rectBut = document.getElementById("rect");
rectBut.addEventListener("click", () => {
    dm.action = "add";
    dm.mode = "rect";
    rectBut.classList.add("active");
    polygonBut.classList.remove("active");
    circleBut.classList.remove("active");

});

const polygonBut = document.getElementById("polygon");
polygonBut.addEventListener("click", () => {
    dm.action = "add";
    dm.mode = "polygon";
    polygonBut.classList.add("active");
    circleBut.classList.remove("active");
    rectBut.classList.remove("active");
});

const infoBut = document.getElementById("info");
infoBut.addEventListener("click", () => {
    let obj = dm.objects.get(dm.active);
    if (obj) {
        obj.text = textinfo.value;
        obj.url = urlinfo.value;
        obj.target = targetinfo.value;
    }
    document.getElementById("result").value = dm.generate2();
});

const infoSVG = document.getElementById("infoSVG");
infoSVG.addEventListener("click", () => {
    let obj = dm.objects.get(dm.active);
    if (obj) {
        obj.text = textinfo.value;
        obj.url = urlinfo.value;
        obj.target = targetinfo.value;
    }
    document.getElementById("result").value = dm.generate();
});




dm.onDeactive = (obj) => {
    obj.text = textinfo.value;
    obj.url = urlinfo.value;
    obj.target = targetinfo.value;
}

dm.onActive = (obj) => {
    textinfo.value = (obj.text) ? obj.text : "";
    urlinfo.value = (obj.url) ? obj.url : "#";
    targetinfo.value = (obj.target)? obj.target : "---";
}

