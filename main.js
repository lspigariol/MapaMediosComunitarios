//Medios de comunicacion comunitarios

//subi el archivo CSV a mi repositorio de github.
var DOWNLOAD = 'https://raw.githubusercontent.com/lspigariol/MapaMediosComunitarios/master/'

window.onload = function() {
    mapConfig();
    parsearCSV();
};

var fondo
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
        this.nombre = nombre
        this.ubicacion = ubicacion
        this.tipo = new TipoMedio(tipo)
        this.sitio = sitio
        this.ciudad = ciudad
        this.provincia = provincia
        this.definicion = definicion
    }

    esRadio(){
        return this.tipo.nombre == "R"
    }
    esTV(){
        return this.tipo.nombre == "T"
    }
    esDeRed(claveRed) {
        if (claveRed == ""){
            return this.definicion==""
        }
        return this.definicion.search(claveRed) != -1
    }
   
    crearMarcador(color){
//        var marker = L.marker(this.ubicacion, { icon: (this.tipo == 'R' ? radioIcon : tvIcon)})
        var marker = L.marker(this.ubicacion, { icon: this.tipo.crearIcono(color),title: this.nombre + " - " + this.ciudad})
        marker.bindPopup(
            `<h3>${this.nombre}</a></h3> 
            <h4> ${this.enlace()}
            <br> ${this.definicion} - ${this.ciudad} - ${this.provincia}
            </h4>`)
        return marker
    }
    enlace(){
        return (this.sitio == "")? "" : `<a href=${this.sitio} target="_blank"> Sitio web </a>`
    }


}

class MapaMedios {

    constructor(){
        this.radios = []
        this.tvs = []
        this.parentGroup
    }
    
    agregarMarcador(medio){
        var marker = medio.crearMarcador("negro")
        if(medio.esRadio()) 
            this.radios.push(marker)
        if(medio.esTV())
            this.tvs.push(marker)
    }
    layer() {
        return this.parentGroup
    }


    armarGrupos(){
        this.parentGroup  = L.markerClusterGroup({maxClusterRadius:40});
        var radiosSubGroup = L.featureGroup.subGroup(this.parentGroup, this.radios)
        var tvSubGroup = L.featureGroup.subGroup(this.parentGroup, this.tvs)
        
     
        radiosSubGroup.addTo(mapa)
        tvSubGroup.addTo(mapa)
    
        L.control.layers(
            null,
                {"Radios":radiosSubGroup
                ,"Televisoras":tvSubGroup
                },
            {collapsed:false}).addTo(mapa)
        this.parentGroup.addTo(mapa)

    }
}

class Red {
    constructor(nombre,clave,color){
        this.nombre = nombre
        this.clave = clave
        this.color = color
        this.markers = []
    }
    agregar(marker){
        this.markers.push(marker)
    }
    crearIcono(){
        return L.icon({
            iconUrl: DOWNLOAD + "punto"+this.color + ".png",
            iconSize: [20, 20]
        })
    }

}
class MapaRedes {
    constructor(){
        this.redes = [
            new Red("Red de medios A","A","verde"),
            new Red("Red nacional F","F","rojo"),
            new Red("Red M","M","azul"),
            new Red("Otras redes","X","marron"),
            new Red("Sin red","","negro")

        ]
    }
    agregarMarcador(medio){
        this.redes.forEach(red=> {
            if (medio.esDeRed(red.clave)){
                var marker = medio.crearMarcador(red.color)
                red.agregar(marker)
            }
        })
    }
    layer() {
        //return new L.LayerGroup(this.redes.flatMap(red=>{red.markers}))
        return new L.LayerGroup(this.redes.flatMap(red=>{return red.markers}))

    }

    // armarGrupos(parentGroup){
    //     var menu = L.control.layers(null,null,{collapsed:false}).addTo(mapa)

    //     this.redes.forEach(red=> {
    //         var subGroup = L.featureGroup.subGroup(parentGroup, red.markers)
    //         subGroup.addTo(mapa)
    //         menu.addOverlay(subGroup,red.nombre)
    //     })
    // }


    armarGrupos(){ 
        //var parentGroup  = L.markerClusterGroup({maxClusterRadius:30});
//        var overLayers = []
        //var menu = L.control.layers(null,null,{collapsed:false}).addTo(mapa)
        var menu = new L.Control.PanelLayers()

        this.redes.forEach(red=> {
            //var subGroup = L.featureGroup.subGroup(parentGroup, red.markers)
            menu.addOverlay({
                name:red.nombre,
                icon:'<i class="icon icon-'+red.color+'"></i>',
                layer: L.layerGroup(red.markers),
                active:true
            })
            // subGroup.addTo(mapa)
            // menu.addOverlay(subGroup,red.nombre)
        })
        //parentGroup.addTo(mapa)
        mapa.addControl( menu )

    }


}
//post: devuelvo en un array todos los datos del csv
//llama a la funciones dentro del callback
function parsearCSV() {
    Papa.parse(DOWNLOAD + "medios.csv", {
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

class TipoMedio {
    constructor(nombre){
        this.nombre =nombre
        this.medida = 20         
    }
    crearIcono(color){
        return L.icon({
            iconUrl: DOWNLOAD + this.nombre + color + ".png",
            iconSize: [this.medida, this.medida]
        })
    }
}

// var tvIcon = L.icon({
//     iconUrl: DOWNLOAD + 'tv.png',
//     iconSize: [40, 40],
// });
// var radioIcon = L.icon({
//     iconUrl: DOWNLOAD + 'radio.png',
//     iconSize: [40, 40],
// });

//pre:recibe un array de medios
//post:crea y muestra marcadores con los medios
function crearMapa(medios) {
    console.log(medios);
    marcadores(medios);
}

function marcadores(medios) {
 
    medios.forEach(medio => {
        tipoMapa.agregarMarcador(medio)
    })
    tipoMapa.armarGrupos()

    var controlSearch = new L.Control.Search({
		position:'topleft',		
		layer: tipoMapa.layer(),
//		layer: new L.layerGroup([]),
		initial: false,
		zoom: 12,
		marker: false
	})

	mapa.addControl( controlSearch );
    // radiosGroup = L.layerGroup(radios).addTo(mapa);
    // tvsGroup = L.layerGroup(tvs).addTo(mapa);
}

// function obtenerCoordenadas(direccion){
//     var resultado;
//     jQuery.getJSON(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${direccion})`,
//         function(data){
//             resultado = [data[0].lat, data[0].lon]
//             console.log(resultado)
//             var blob = new Blob(resultado, {type: "text/plain;charset=utf-8"});
//             saveAs(blob, "testfile1.txt");
//         }); 
//     return resultado;

// }

