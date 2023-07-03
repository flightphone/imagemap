export function DrawMap(id) {
    this.mSVG = document.getElementById(id);
    this.isDrawing = false;
    this.mode = "rect";
    this.action = "add";
    this.objects = new Map();
    this.n = 0;
    this.active = 0;
    this.activepoint = -1;
    this.SVGwidth = 1000;
    this.r = 6;

    this.x = 0;
    this.y = 0;
    this.buferImage = new Image();
    this.image = document.createElementNS('http://www.w3.org/2000/svg', 'image'); //new Image();
    this.input = document.createElement("input");
    this.input.setAttribute("type", "file");

    //load image
    this.loadImage = function () {

        this.input.click()
    }

    this.input.onchange = (ev) => {
        const file = ev.target.files[0]; // get the file

        if (!file)
            return;

        const blobURL = URL.createObjectURL(file);
        this.buferImage.src = blobURL;
        this.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', blobURL);
        this.fileurl = file.name;

    }

    this.setsize = () => {
        let winnerWidth = document.getElementById("main_block").clientWidth;
        let w = Math.min(this.w, winnerWidth  * 0.9);
        this.mSVG.setAttribute("width", `${w}px`);
        return w;
    }
    window.addEventListener('resize', () => {
        this.setsize();
      }, true);
      

    this.buferImage.addEventListener("load", (e) => {
        
        this.mSVG.innerHTML = "";
        this.w = this.buferImage.width;
        this.h = this.buferImage.height;
        this.image.style.width = `${this.w}px`;
        let vb = `0 0 ${this.w} ${this.h}`;
        this.mSVG.setAttribute("viewBox", vb);
        
        this.SVGwidth = this.setsize();
        
        this.mSVG.appendChild(this.image);
        //init svg
        this.isDrawing = false;
        this.mode = "rect";
        this.action = "add";
        this.objects = new Map();
        this.n = 0;
        this.active = 0;
        this.activepoint = -1;

        if (this.onLoad)
            this.onLoad();

    });


    this.add = (x, y) => {
        this.n += 1;
        if (this.active > 0)
            this.deactivate(this.active);
        this.active = this.n;
        let p = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        p.setAttribute("cx", x);
        p.setAttribute("cy", y);
        p.setAttribute("r", this.r * this.w / this.SVGwidth);
        p.setAttribute("class", "image-mapper-point");
        p.setAttribute("data-index", this.active);
        p.setAttribute("data-point", 0);
        let obj = {
            ftype: this.mode,
            points: [{ x: x, y: y }],
            circles: [p]
        }
        if (this.mode == "polygon") {
            //create polygon
            let poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            poly.setAttribute("class", "image-mapper-shape");
            poly.setAttribute("data-index", this.active);
            obj.element = poly;

            let poi = this.mSVG.createSVGPoint();
            poi.x = x;
            poi.y = y;
            obj.polygon = [poi];
            poly.points.appendItem(poi);
            this.mSVG.appendChild(poly);

        }

        this.objects.set(this.active, obj);
        this.action = "edit"
        this.mSVG.appendChild(p);
    }

    this.edit = (x, y) => {
        let obj = this.objects.get(this.active);
        if (!obj) {
            return;
        }

        let p = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        p.setAttribute("cx", x);
        p.setAttribute("cy", y);
        p.setAttribute("r", this.r * this.w / this.SVGwidth);
        p.setAttribute("class", "image-mapper-point");
        p.setAttribute("data-index", this.active);
        p.setAttribute("data-point", obj.points.length);
        obj.points.push({ x: x, y: y })
        obj.circles.push(p);
        this.mSVG.appendChild(p);

        let ftype = obj.ftype;
        if (ftype == "rect") {
            this.createRect(obj);
            this.action = "add";
        }
        if (ftype == "circle") {
            this.createCircle(obj);
            this.action = "add";
        }

        if (ftype == "polygon") {
            this.createPolygon(obj);
            //this.action = "add";
        }

        this.activate(this.active);
    };

    this.deactivate = (active) => {
        let obj = this.objects.get(active);
        if (!obj)
            return
        for (let i = 0; i < obj.circles.length; i++) {
            obj.circles[i].setAttribute("class", "hide-point");
        }
        if (!obj.element)
            return;
        obj.element.classList.remove("selected");
        if (this.onDeactive)
            this.onDeactive(obj);

    }

    this.activate = (active) => {
        let obj = this.objects.get(active);
        if (!obj)
            return
        for (let i = 0; i < obj.circles.length; i++) {
            obj.circles[i].setAttribute("class", "image-mapper-point");
        }
        if (!obj.element)
            return;
        obj.element.classList.add("selected");
        if (this.onActive)
            this.onActive(obj);
    }

    this.createRect = (obj) => {
        let x1 = Math.min(obj.points[0].x, obj.points[1].x);
        let x2 = Math.max(obj.points[0].x, obj.points[1].x);
        let y1 = Math.min(obj.points[0].y, obj.points[1].y);
        let y2 = Math.max(obj.points[0].y, obj.points[1].y);
        let p = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        p.setAttribute("x", x1);
        p.setAttribute("y", y1);
        p.setAttribute("width", (x2 - x1));
        p.setAttribute("height", (y2 - y1));
        p.setAttribute("class", "image-mapper-shape");
        p.setAttribute("data-index", this.active);
        obj.element = p;
        this.mSVG.appendChild(p);
    }

    this.createCircle = (obj) => {
        let x = obj.points[0].x;
        let y = obj.points[0].y;
        let r = (obj.points[0].x - obj.points[1].x) * (obj.points[0].x - obj.points[1].x) +
            (obj.points[0].y - obj.points[1].y) * (obj.points[0].y - obj.points[1].y);
        r = Math.sqrt(r);
        let p = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        p.setAttribute("cx", x);
        p.setAttribute("cy", y);
        p.setAttribute("r", r);
        p.setAttribute("class", "image-mapper-shape");
        p.setAttribute("data-index", this.active);
        obj.element = p;
        this.mSVG.appendChild(p);
    }

    this.createPolygon = (obj) => {
        let n = obj.points.length;
        let poi = this.mSVG.createSVGPoint();
        poi.x = obj.points[n - 1].x;
        poi.y = obj.points[n - 1].y;
        obj.polygon.push(poi);
        obj.element.points.appendItem(poi);

    }


    this.move = (active, point, dx, dy) => {
        let obj = this.objects.get(active);
        if (point == -1)
            for (let i = 0; i < obj.points.length; i++) {
                obj.points[i].x += dx;
                obj.points[i].y += dy;
            }
        else {
            obj.points[point].x += dx;
            obj.points[point].y += dy;
        }
    }
    this.render = (active) => {
        let obj = this.objects.get(active);
        if (!obj)
            return;
        for (let i = 0; i < obj.circles.length; i++) {
            let a = obj.circles[i];
            let x = obj.points[i].x;
            let y = obj.points[i].y;
            a.setAttribute("cx", x);
            a.setAttribute("cy", y);
        }
        let ftype = obj.ftype;
        if (ftype == "rect") {
            this.renderRect(obj);
        }
        if (ftype == "circle") {
            this.renderCircle(obj);
        }
        if (ftype == "polygon") {
            this.renderPolygon(obj);
        }


    };
    this.renderRect = (obj) => {
        if (obj.points.length < 2)
            return;
        let x1 = Math.min(obj.points[0].x, obj.points[1].x);
        let x2 = Math.max(obj.points[0].x, obj.points[1].x);
        let y1 = Math.min(obj.points[0].y, obj.points[1].y);
        let y2 = Math.max(obj.points[0].y, obj.points[1].y);
        let p = obj.element;
        p.setAttribute("x", x1);
        p.setAttribute("y", y1);
        p.setAttribute("width", (x2 - x1));
        p.setAttribute("height", (y2 - y1));

    }

    this.renderCircle = (obj) => {
        if (obj.points.length < 2)
            return;
        let x = obj.points[0].x;
        let y = obj.points[0].y;
        let r = (obj.points[0].x - obj.points[1].x) * (obj.points[0].x - obj.points[1].x) +
            (obj.points[0].y - obj.points[1].y) * (obj.points[0].y - obj.points[1].y);
        r = Math.sqrt(r);
        let p = obj.element;
        p.setAttribute("cx", x);
        p.setAttribute("cy", y);
        p.setAttribute("r", r);
    }


    this.renderPolygon = (obj) => {
        for (let i = 0; i < obj.points.length; i++) {
            let a = obj.polygon[i];
            a.x = obj.points[i].x;
            a.y = obj.points[i].y;
        }
    };

    this.click = (x, y) => {
        if (this.action == "add")
            this.add(x, y);
        else
            this.edit(x, y);
    }


    this.delete = () => {
        let obj = this.objects.get(this.active);
        this.active = 0;
        this.action = "add";
        if (!obj)
            return
        obj.deleted = true;
        for (let i = 0; i < obj.circles.length; i++) {
            this.mSVG.removeChild(obj.circles[i])
        }
        if (!obj.element)
            return;
        this.mSVG.removeChild(obj.element)
    }

    this.scale = (x) => {
        return ((x * this.w) / this.mSVG.width.baseVal.value);
    }

    this.mSVG.addEventListener("mousedown", (e) => {
        this.x = this.scale(e.offsetX);
        this.y = this.scale(e.offsetY);


        if (e.target.dataset.index) {
            let active = parseInt(e.target.dataset.index);
            //edit figure
            if (this.action == "edit") {
                if (this.active == active) {
                    this.action = "add";
                }
                else
                    return;
            }

            if (active != this.active) {
                this.deactivate(this.active)
                this.active = active;
                this.activate(this.active);
            }
            this.active = active;


            if (e.target.dataset.point != null)
                this.activepoint = parseInt(e.target.dataset.point)
            else {
                e.target.classList.add("image-move");
                this.activepoint = -1;
            }
            this.isDrawing = true;

        }
        else {
            this.click(this.x, this.y);
        }
    });

    this.limit = 18 + 6 - 4;
    this.generate2 = () => {
        // if (!localStorage.cnt)
        //     localStorage.cnt = "0";

        // let cnt = parseInt(localStorage.cnt);
        // cnt += 1;
        // if (cnt > this.limit)
        //     return "";
        // localStorage.cnt = cnt;

        let result = `<img src="${this.fileurl}" usemap="#image-map">\n<map name="image-map">`;

        for (let i = 0; i < this.mSVG.children.length; i++) {
            if (this.mSVG.children[i].classList.contains("image-mapper-shape")) {
                let ix = parseInt(this.mSVG.children[i].dataset.index);
                let obj = this.objects.get(ix);
                if (!obj)
                    continue;
                let text = (obj.text) ? obj.text : "";
                let url = (obj.url) ? obj.url : "#";
                let target = (obj.target) ? obj.target : "";
                if (target == "---")
                    target = "";
                let shape = "";
                let coords = "";
                let ftype = obj.ftype;
                if (ftype == "rect") {
                    shape = "rect";
                    coords = `${Math.round(obj.points[0].x)},${Math.round(obj.points[0].y)},${Math.round(obj.points[1].x)},${Math.round(obj.points[1].y)}`;
                }
                if (ftype == "circle") {
                    shape = "circle";
                    let x = parseInt(obj.element.getAttribute("cx"));
                    let y = parseInt(obj.element.getAttribute("cy"));
                    let r = parseInt(obj.element.getAttribute("r"));
                    coords = `${x},${y},${r}`;
                }
                if (ftype == "polygon") {
                    shape = "poly"
                    coords = `${Math.round(obj.points[0].x)},${Math.round(obj.points[0].y)}`;
                    for (let i = 1; i < obj.points.length; i++)
                        coords = coords + `,${Math.round(obj.points[i].x)},${Math.round(obj.points[i].y)}`;
                }
                
                
                let area = `    <area target="${target}" alt="${text}" title="${text}" href="${url}" coords="${coords}" shape="${shape}"></area>`;
                result = result + "\n" + area
            }
        }
        result = result + "\n</map>";
        return result;
    }

    this.generate = () => {
        // if (!localStorage.cnt)
        //     localStorage.cnt = "0";

        // let cnt = parseInt(localStorage.cnt);
        // cnt += 1;
        // if (cnt > this.limit)
        //     return "";
        // localStorage.cnt = cnt;

        let stylestr = `
<style>
.image-mapper-shape {
    fill: rgba(0, 0, 0, 0);
}
g:hover .image-mapper-shape {
    stroke: white;
    stroke-width: 4;
}
.image-text {
    font-family: Verdana;
    font-size: 22px;
    fill: rgba(0, 0, 0, 0);
}

g:hover .image-text {
    fill: white;
}
</style>
        `

        let swidth = ` width = "${this.w}" `;
        if (this.w > 1200)
            swidth = ` style="width:100%" `;
        let vb = this.mSVG.getAttribute("viewBox");
        let stsvg = `<svg ${swidth} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb}">`;
        let result = stsvg + stylestr;

        let simg = this.image.outerHTML;
        let re = /href="(.*?)"/i;
        let newhref = `href="${this.fileurl}"`;
        simg = simg.replace(re, newhref);
        result = result + "\n" + simg;

        for (let i = 0; i < this.mSVG.children.length; i++) {
            if (this.mSVG.children[i].classList.contains("image-mapper-shape")) {
                let ix = parseInt(this.mSVG.children[i].dataset.index);
                let obj = this.objects.get(ix);
                if (!obj)
                    continue;
                let text = (obj.text) ? obj.text : "";
                let url = (obj.url) ? obj.url : "#";
                let target = (obj.target) ? obj.target : "";

                let astr = `<a xlink:href="${url}" target="${target}" xlink:title="${text}">`
                result = result + "\n" + astr;

                result = result + "\n<g>";
                result = result + "\n" + this.mSVG.children[i].outerHTML;

                let txttag = `<text class="image-text" x="${obj.points[0].x}" y="${obj.points[0].y}">${text}</text>`;
                result = result + "\n" + txttag;

                result = result + "\n</g>";
                result = result + "\n" + "</a>";
            }
        }
        result = result + "\n" + "</svg>";
        return result;
    }


    window.addEventListener("mouseup", (e) => {
        if (this.isDrawing) {
            this.x = 0;
            this.y = 0;
            this.isDrawing = false;
            if (this.active > 0) {
                let obj = this.objects.get(this.active)
                if (!obj.element)
                    return;
                obj.element.classList.remove("image-move");
            }

        }
    });


    this.mSVG.addEventListener("mousemove", (e) => {
        if (this.isDrawing) {
            this.move(this.active, this.activepoint, this.scale(e.offsetX) - this.x, this.scale(e.offsetY) - this.y);
            this.x = this.scale(e.offsetX);
            this.y = this.scale(e.offsetY);
            this.render(this.active);
        }

    });

    this.mSVG.addEventListener("touchmove", (e) => {
        if (this.active == 0)
            return;
        const touches = e.changedTouches;

        this.move(this.active, this.activepoint, this.scale(touches[0].pageX) - this.x, this.scale(touches[0].pageY) - this.y);
        this.x = this.scale(touches[0].pageX);
        this.y = this.scale(touches[0].pageY);
        this.render(this.active);
    });

    this.mSVG.addEventListener("touchstart", (e) => {
        if (this.active == 0)
            return;
        const touches = e.changedTouches;
        this.x = this.scale(touches[0].pageX);
        this.y = this.scale(touches[0].pageY);
        //this.render(this.active);
    });

}