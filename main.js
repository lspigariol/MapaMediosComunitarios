//Medios de comunicacion comunitarios

var mymap;
//subi el archivo CSV a mi repositorio de github.
var CSV_DOWNLOAD_LINK = "https://raw.githubusercontent.com/lspigariol/MapaMediosComunitarios/master/medios.csv";
var DOWNLOAD = 'https://raw.githubusercontent.com/lspigariol/MapaMediosComunitarios/master/'

window.onload = function() {
    mapConfig();
    parsearCSV();
};

/*CONFIGURANDO Y MOSTRANDO EL MAPA*/
function mapConfig() {
    mapa = L.map('mapa').setView([-40.231486, -66.197284], 4);
    fondo = L.tileLayer('https://api.mapbox.com/styles/v1/lspigariol/ck821ynph157i1ip5g7adr5aj/tiles/256/{z}/{x}/{y}?access_token={accessToken}',{
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        accessToken: 'pk.eyJ1IjoibHNwaWdhcmlvbCIsImEiOiJjazgxdTUwMDIwdWljM2xyeWpuOG9yeDgxIn0.Zy4aVSnA7Jh1Y5uXnRUxDg'
    }).addTo(mapa);

}

class Medio {
    constructor(nombre,ubicacion,tipo, sitio, ciudad, provincia,definicion){
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.tipo = tipo;
        this.sitio = sitio;
        this.ciudad = ciudad;
        this.provincia = provincia;
        this.definicion = definicion;
    }
}
//post: devuelvo en un array todos los datos del csv
//llama a la funciones dentro del callback
function parsearCSV() {
    Papa.parse(CSV_DOWNLOAD_LINK, {
        complete: function(results) {
            crearMapa(convertirDatos(results));
        },
        download: true,
    }, )
}

//pre: recibe un array de arrays
//post:devuelve un array de medios 
function convertirDatos(results) {
    let medios = new Array();
    results.data.forEach(element => {
        medios.push(new Medio(
            nombre = element[1],
            ubicacion = [element[3],element[4]],
            // Latitud y longitud
            tipo = element[2],
            sitio = element[5],
            ciudad = element[8],
            provincia = element[9],
            definicion = element[7]
        ));
    });
    return medios;
}

var tvIcon = L.icon({
    iconUrl: DOWNLOAD + 'tv.png',
    iconSize: [40, 40],
});
var radioIcon = L.icon({
    iconUrl: DOWNLOAD + 'radio.png',
    iconSize: [40, 40],
});

//pre:recibe un array de medios
//post:crea y muestra marcadores con los medios
function crearMapa(medios) {
    console.log(medios);
    marcadores(medios);
}

function marcadores(medios) {
    var marker;
    var radios = [];
    var tvs = [];
//    var comu = [];
    medios.forEach(medio => {
        marker = L.marker(medio.ubicacion, { icon: (medio.tipo == 'R' ? radioIcon : tvIcon) });
        marker.bindPopup(
            `<h3><a href=http://${medio.sitio} target="_blank"> ${medio.nombre}</a></h3> 
            <h4> ${medio.definicion}
            <br> ${medio.ciudad} - ${medio.provincia}
            </h4>`);
        if(medio.tipo == 'R') 
            radios.push(marker);
        if(medio.tipo == 'T')
            tvs.push(marker);
        // if(medio.definicion.search("Comunitaria") != -1)
        //     comu.push(marker);
            
    });
    radiosGroup = L.layerGroup(radios).addTo(mapa);
    tvsGroup = L.layerGroup(tvs).addTo(mapa);
//    comuGroup = L.layerGroup(comu).addTo(mapa);
    L.control.layers(
        null,
            {"Radios":radiosGroup
            ,"Televisoras":tvsGroup
//          ,"Comunitarias":comuGroup
            },
        {collapsed:false}).addTo(mapa)
}

function niveles(medios){
    
}
