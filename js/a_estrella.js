let canvas;
let ctx;
const FPS = 50;

//ESCENARIO
const columnas = 20;
const filas = 20;
const randomFactor = 5;
let escenario;  //matriz del nivel

//TILES
let anchoT;
let altoT;
const obstaculo = '#000000';
const suelo = '#CAD9DF';
//RUTA
let principio;
let fin;

let openSet = [];
let closedSet = [];

let camino = [];
let terminado = false;

const creaArray2D = (filas, columnas) => {
    let obj = new Array(filas);
    for (let i = 0; i < filas; i++) {
        obj[i] = new Array(columnas);
    }
    return obj;
}

const heuristica = (a, b) => {
    let x = Math.abs(a.x - b.x);
    let y = Math.abs(a.y - b.y);

    let dist = x + y;

    return dist;
}
const borraDelArray = (array, elemento) => {
    for (i = array.length - 1; i >= 0; i--) {
        if (array[i] == elemento) {
            array.splice(i, 1);
        }
    }
}
function Casilla(x, y) {
    this.x = x;
    this.y = y;

    //TIPO (obstáculo=1, vacío=0)
    this.tipo = 0;

    let aleatorio = Math.floor(Math.random() * randomFactor);
    if (aleatorio == 1)
        this.tipo = 1;

    this.f = 0;  //coste total (g+h)
    this.g = 0;  //pasos dados
    this.h = 0;  //heurística (estimación de lo que queda)

    this.vecinos = [];
    this.padre = null;


    this.addVecinos =  () => {
        if (this.x > 0)
            this.vecinos.push(escenario[this.y][this.x - 1]);   //vecino izquierdo

        if (this.x < filas - 1)
            this.vecinos.push(escenario[this.y][this.x + 1]);   //vecino derecho

        if (this.y > 0)
            this.vecinos.push(escenario[this.y - 1][this.x]);   //vecino de arriba

        if (this.y < columnas - 1)
            this.vecinos.push(escenario[this.y + 1][this.x]); //vecino de abajo
    }

    this.dibuja = () => {
        let color;
        if (this.tipo == 0)
            color = suelo;
        if (this.tipo == 1)
            color = obstaculo;
        ctx.fillStyle = color;
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }
    //DIBUJA OPENSET
    this.dibujaOS =  () => {
        ctx.fillStyle = '#8CCAF3';
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }
    //DIBUJA CLOSEDSET
    this.dibujaCS = () => {
        ctx.fillStyle = '#DA5454';
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }
    //DIBUJA CAMINO
    this.dibujaCamino = () => {
        ctx.fillStyle = '#53D879';
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }
}

const inicializar = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    anchoT = parseInt(canvas.width / columnas);
    altoT = parseInt(canvas.height / filas);

    escenario = creaArray2D(filas, columnas);

    for (i = 0; i < filas; i++) {
        for (j = 0; j < columnas; j++) {
            escenario[i][j] = new Casilla(j, i)
        }
    }

    for (i = 0; i < filas; i++) {
        for (j = 0; j < columnas; j++) {
            escenario[i][j].addVecinos();
        }
    }

    principio = escenario[0][filas - 1];
    fin = escenario[columnas - 1][0];
    
    openSet.push(principio);
    setInterval( () => { principal(); }, 1000 / FPS);
}



const dibujaEscenario = () => {
    for (i = 0; i < filas; i++) {
        for (j = 0; j < columnas; j++) {
            escenario[i][j].dibuja();
        }
    }

    //DIBUJA OPENSET
    for (i = 0; i < openSet.length; i++) {
        openSet[i].dibujaOS();
    }


    //DIBUJA CLOSEDSET
    for (i = 0; i < closedSet.length; i++) {
        closedSet[i].dibujaCS();
    }

    for (i = 0; i < camino.length; i++) {
        camino[i].dibujaCamino();
    }
}

const borraCanvas = () => {
    canvas.width = canvas.width;
    canvas.height = canvas.height;
}

const algoritmo = () => {

    //SEGUIMOS HASTA ENCONTRAR SOLUCIÓN
    if (terminado != true) {

        //SEGUIMOS SI HAY AlGO EN OPENSET
        if (openSet.length > 0) {
            let ganador = 0;  //índie o posición dentro del array openset del ganador

            //evaluamos que OpenSet tiene un menor coste / esfuerzo
            for (i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[ganador].f) {
                    ganador = i;
                }
            }
            let actual = openSet[ganador];
            if (actual === fin) {

                let temporal = actual;
                camino.push(temporal);

                while (temporal.padre != null) {
                    temporal = temporal.padre;
                    camino.push(temporal);
                }
                console.log('camino encontrado');
                terminado = true;
            }
            else {
                borraDelArray(openSet, actual);
                closedSet.push(actual);
                let vecinos = actual.vecinos;
                for (i = 0; i < vecinos.length; i++) {
                    let vecino = vecinos[i];
                    if (!closedSet.includes(vecino) && vecino.tipo != 1) {
                        let tempG = actual.g + 1;
                        if (openSet.includes(vecino)) {
                            if (tempG < vecino.g) {
                                vecino.g = tempG;
                            }
                        }
                        else {
                            vecino.g = tempG;
                            openSet.push(vecino);
                        }
                        vecino.h = heuristica(vecino, fin);
                        vecino.f = vecino.g + vecino.h;
                        vecino.padre = actual;
                    }
                }
            }
        }
        else {
            console.log('No hay un camino posible');
            terminado = true;   //el algoritmo ha terminado
        }
    }
}

const principal = () => {
    borraCanvas();
    algoritmo();
    dibujaEscenario();
}