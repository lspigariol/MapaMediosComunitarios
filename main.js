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
    constructor(nombre,tipo, ubicacion, sitio, frecuencia, provincia, red, definicion){
        this.nombre = nombre
        this.ubicacion = ubicacion
        this.tipo = new TipoMedio(tipo)
        this.sitio = sitio
        this.frecuencia = frecuencia
        this.provincia = provincia
        this.red = red
        this.definicion = definicion
    }

    esRadio(){
        return this.tipo.nombre == "R"
    }
    esTV(){
        return this.tipo.nombre == "T"
    }
    esDeRed(claveRed, caracteristica) {
        var carac = caracteristica.call(null,this)
        if (claveRed == ""){
            return carac==""
        }
        return carac.search(claveRed) != -1
    }
   
    crearMarcador(color){
//        var marker = L.marker(this.ubicacion, { icon: (this.tipo == 'R' ? radioIcon : tvIcon)})
        var marker = L.marker(this.ubicacion, { icon: this.tipo.crearIcono(color),title: this.nombre + " - " + this.provincia})
        marker.bindPopup(
            `<h3>${this.nombre}</a></h3> 
            <h4> ${this.enlace()}
            <br> ${this.definicion} - ${this.red}
            <br> ${this.frecuencia} - ${this.provincia}
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
        var marker = medio.crearMarcador("verde")
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
    contenidoIndicaciones(){
        return 'Los círculos indican la cantidad de medios en la zona, radios y tv. <br> Los tonos de color representan la concentración.'
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
    constructor(items,caracteristica){
        this.redes = items 
        this.caracteristica = caracteristica
    }
    agregarMarcador(medio){
        this.redes.forEach(red=> {
            if (medio.esDeRed(red.clave,this.caracteristica)){
                var marker = medio.crearMarcador(red.color)
                red.agregar(marker)
            }
        })
    }
    layer() {
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
    contenidoIndicaciones(){
        return ''
    }

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
    var medios = new Array()
    results.data.forEach(element => {
        medios.push(new Medio(
            nombre = element[1],
            tipo = element[2],
            ubicacion = [element[3],element[4]],
            // Latitud y longitud
            sitio = element[5],
            frecuencia = element[6],
            provincia = element[7],
            red = element[8],
            definicion = element[9]
        ))
    })
    return medios
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

//pre:recibe un array de medios
//post:crea y muestra marcadores con los medios
function crearMapa(medios) {
    console.log(medios)
    marcadores(medios)
    referencias()
}

function marcadores(medios) {
 
    medios.forEach(medio => {
        tipoMapa.agregarMarcador(medio)
    })
    tipoMapa.armarGrupos()

    var controlSearch = new L.Control.Search({
		position:'topleft',		
		layer: tipoMapa.layer(),
		initial: false,
		zoom: 12,
		marker: false
	})

    mapa.addControl( controlSearch )
    
}


function referencias() {

    var indicaciones = L.control({position: 'bottomright'});
    var leyendaIcono = 'Al clikear en el icono de Radio o TV se muestran sus datos de contacto y el enlace a su sitio web, en caso de disponer.' 
    var leyendaZoom = 'Los iconos + y - son para acercar y alejar el mapa. La lupa es para buscar un medio a partir de sus datos básicos.'
    var contenido = `<h2>Los datos son de prueba, no representan medios reales</h2> <h3>Indicaciones</h3> <hs>${tipoMapa.contenidoIndicaciones()} <br>${leyendaIcono} <br> ${leyendaZoom} </h5>`
    indicaciones.onAdd = function (mapa) {
        var div = L.DomUtil.create('div', 'info legend')
        div.innerHTML = contenido
        return div
    }
    //indicaciones.addTo(mapa)


    var dialog = L.control.dialog({size:[200,320],position:'topleft',anchor:[0,40]})
              .setContent(contenido)
 //             .showClose()
              .addTo(mapa)
  //            .unLock()
  //dialog.hideClose()
  //dialog.showClose()
    

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

